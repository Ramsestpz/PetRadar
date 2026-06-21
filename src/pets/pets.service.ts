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
    // Mapeo explícito para asegurar que todos los campos requeridos existan
    const pet = this.lostPetRepo.create({
      name: data.name,
      species: data.species,
      breed: data.breed,
      color: data.color,
      size: data.size,
      description: data.description,
      owner_name: data.owner_name,
      owner_email: data.owner_email,
      owner_phone: data.owner_phone,
      address: data.address,
      lost_date: data.lost_date,
      location: data.location, // Asegúrate que venga como { type: 'Point', coordinates: [lng, lat] }
    });
    return await this.lostPetRepo.save(pet);
  }

  async createFoundPet(data: any) {
    // 1. Guardar la mascota encontrada con mapeo explícito
    const foundPet = this.foundPetRepo.create({
      species: data.species,
      breed: data.breed,
      color: data.color,
      size: data.size,
      description: data.description,
      finder_name: data.finder_name,
      finder_email: data.finder_email,
      finder_phone: data.finder_phone,
      address: data.address,
      location: data.location,
    });
    await this.foundPetRepo.save(foundPet);

    // 2. Extraer coordenadas del objeto GeoJSON
    const lng = data.location.coordinates[0];
    const lat = data.location.coordinates[1];

    // 3. Buscar coincidencias
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
      const mailOptions = {
        from: '"PetRadar Notifications" <tepozramses@gmail.com>',
        to: lostPet.owner_email || 'tepozramses@gmail.com',
        subject: '¡Buenas noticias! Posible coincidencia encontrada',
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Posible coincidencia encontrada</h2>
            <p>Se ha detectado una mascota encontrada cerca de tu ubicación.</p>
            <ul>
              <li><strong>Nombre del buscador:</strong> ${foundData.finder_name}</li>
              <li><strong>Teléfono:</strong> ${foundData.finder_phone}</li>
            </ul>
          </div>
        `,
      };
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error enviando email:', error.message);
    }
  }
}