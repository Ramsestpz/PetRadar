import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LostPet } from './entities/lost-pet.entity';
import { FoundPet } from './entities/found-pet.entity';
import * as nodemailer from 'nodemailer';

@Injectable()
export class PetsService {
  private transporter;

  constructor(
    @InjectRepository(LostPet) private lostPetRepo: Repository<LostPet>,
    @InjectRepository(FoundPet) private foundPetRepo: Repository<FoundPet>,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'tepozramses@gmail.com',
        pass: process.env.MAILER_PASSWORD,
      },
    });
  }

  async createLostPet(data: any) {
    // Se guarda el objeto tal cual, asumiendo que data ya incluye la estructura correcta
    const pet = this.lostPetRepo.create(data);
    return await this.lostPetRepo.save(pet);
  }

  async createFoundPet(data: any) {
    // 1. Guardar la mascota encontrada
    const foundPet = this.foundPetRepo.create(data);
    await this.foundPetRepo.save(foundPet);

    // 2. Extraer coordenadas de manera segura del objeto GeoJSON
    // Esto evita que lleguen nulas a la consulta SQL
    const lng = data.location?.coordinates[0];
    const lat = data.location?.coordinates[1];

    // 3. Buscar coincidencias usando las coordenadas extraídas
    const matches = await this.lostPetRepo.query(`
      SELECT *,
        ST_X(location::geometry) AS lost_lng,
        ST_Y(location::geometry) AS lost_lat,
        ST_Distance(
          location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) AS distance
      FROM lost_pets
      WHERE is_active = true
        AND ST_DWithin(
          location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          500
        )
      ORDER BY distance ASC;
    `, [lng, lat]);

    // 4. Enviar notificación si hubo match
    if (matches.length > 0) {
      for (const lostPet of matches) {
        await this.sendMatchEmail(lostPet, data);
      }
    }

    return { message: 'Mascota registrada', matches_found: matches.length };
  }

  async getLostPets() {
    return await this.lostPetRepo.find({
      where: { is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  async getFoundPets() {
    return await this.foundPetRepo.find({
      order: { created_at: 'DESC' },
    });
  }

  private async sendMatchEmail(lostPet: any, foundData: any) {
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px;">
          <div style="background-color: #FF5A5F; color: white; padding: 25px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 26px;">PetRadar Alert</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">Possible match found!</p>
          </div>

          <div style="padding: 30px 20px; background-color: #ffffff;">
            <p style="font-size: 16px; color: #484848; line-height: 1.6;">
              Hello! The system has detected an animal nearby with similar characteristics.
            </p>
            
            <div style="background-color: #f7f7f9; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #00A699;">
              <h3 style="margin-top: 0; color: #222222; font-size: 18px;">Finder Information:</h3>
              <ul style="list-style: none; padding: 0; margin: 0; color: #484848; font-size: 15px; line-height: 1.8;">
                <li><strong>Name:</strong> ${foundData.finder_name}</li>
                <li><strong>Phone:</strong> ${foundData.finder_phone}</li>
                <li><strong>Email:</strong> ${foundData.finder_email}</li>
                <li><strong>Description:</strong> ${foundData.description}</li>
              </ul>
            </div>
          </div>

          <div style="background-color: #f0f0f0; color: #767676; text-align: center; padding: 15px; font-size: 12px;">
            Automatic message from PetRadar API - ${new Date().getFullYear()}
          </div>
        </div>
      `;

      const mailOptions = {
        from: '"PetRadar Notifications" <tepozramses@gmail.com>',
        to: lostPet.owner_email || 'tepozramses@gmail.com',
        subject: 'Good news! Possible match found',
        html: emailHtml,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${lostPet.owner_email}`);
    } catch (error) {
      console.error('Error sending email:', error.message);
    }
  }
}