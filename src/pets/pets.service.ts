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
    const pet = this.lostPetRepo.create({
      ...data,
      location: { type: 'Point', coordinates: [data.lng, data.lat] },
    });
    return await this.lostPetRepo.save(pet);
  }

  async createFoundPet(data: any) {
    const foundPet = this.foundPetRepo.create({
      ...data,
      location: { type: 'Point', coordinates: [data.lng, data.lat] },
    });
    await this.foundPetRepo.save(foundPet);

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
    `, [data.lng, data.lat]);

    if (matches.length > 0) {
      for (const lostPet of matches) {
        await this.sendMatchEmail(lostPet, data);
      }
    }

    return { message: 'Mascota registrada', matches_found: matches.length };
  }

  private async sendMatchEmail(lostPet: any, foundData: any) {
    const mapboxToken = process.env.MAPBOX_TOKEN; 
    const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-a+f00(${lostPet.lost_lng},${lostPet.lost_lat}),pin-s-b+00f(${foundData.lng},${foundData.lat})/auto/500x300?access_token=${mapboxToken}`;
    
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        
        <div style="background-color: #FF5A5F; color: white; padding: 25px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 26px; letter-spacing: 1px;">🐾 Alerta PetRadar</h1>
          <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">¡Posible coincidencia encontrada!</p>
        </div>

        <div style="padding: 30px 20px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #484848; line-height: 1.6; margin-top: 0;">
            ¡Hola! El sistema ha detectado un animalito en un radio cercano con características similares a <strong>${lostPet.name}</strong>.
          </p>
          
          <div style="background-color: #f7f7f9; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #00A699;">
            <h3 style="margin-top: 0; color: #222222; font-size: 18px;">Datos de quien lo encontró:</h3>
            <ul style="list-style: none; padding: 0; margin: 0; color: #484848; font-size: 15px; line-height: 1.8;">
              <li>👤 <strong>Nombre:</strong> ${foundData.finder_name}</li>
              <li>📞 <strong>Teléfono:</strong> <a href="tel:${foundData.finder_phone}" style="color: #00A699; text-decoration: none;">${foundData.finder_phone}</a></li>
              <li>✉️ <strong>Email:</strong> <a href="mailto:${foundData.finder_email}" style="color: #00A699; text-decoration: none;">${foundData.finder_email}</a></li>
              <li>📝 <strong>Descripción dada:</strong> <em>"${foundData.description}"</em></li>
            </ul>
          </div>

          <h3 style="color: #222222; text-align: center; margin-bottom: 15px; font-size: 18px;">Ubicación del Hallazgo</h3>
          <div style="text-align: center;">
            <img src="${mapUrl}" alt="Mapa de ubicación" style="max-width: 100%; height: auto; border-radius: 10px; border: 1px solid #dddddd; display: block; margin: 0 auto;" />
            <p style="font-size: 13px; color: #767676; margin-top: 12px;">
              📍 <span style="color: #FF0000; font-weight: bold;">Pin Rojo:</span> Lugar de extravío <br>
              📍 <span style="color: #0000FF; font-weight: bold;">Pin Azul:</span> Lugar de hallazgo
            </p>
          </div>
        </div>

        <div style="background-color: #f0f0f0; color: #767676; text-align: center; padding: 15px; font-size: 12px;">
          Este es un mensaje automático de la API de PetRadar.<br>
          © ${new Date().getFullYear()} PetRadar Inc.
        </div>
      </div>
    `;

    const mailOptions = {
      from: '"PetRadar Notificaciones" <tepozramses@gmail.com>',
      to: 'tepozramses@gmail.com',
      subject: `¡Buenas noticias! Posible coincidencia para ${lostPet.name} 🐶`,
      html: emailHtml,
    };

    await this.transporter.sendMail(mailOptions);
  }
}