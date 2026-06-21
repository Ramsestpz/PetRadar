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
    // Mapeo explícito para asegurar que los campos obligatorios se pasen
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
      lost_date: data.lost_date || new Date(), // Default a hoy
      location: data.location,
    });
    return await this.lostPetRepo.save(pet);
  }

  async createFoundPet(data: any) {
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
      found_date: data.found_date || new Date(), // Default a hoy
      location: data.location,
    });
    await this.foundPetRepo.save(foundPet);

    // Extraer coordenadas
    const lng = data.location.coordinates[0];
    const lat = data.location.coordinates[1];

    const matches = await this.lostPetRepo.query(`
      SELECT *,
        ST_Distance(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distance
      FROM lost_pets
      WHERE is_active = true
        AND ST_DWithin(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, 500)
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
    return await this.lostPetRepo.find({ where: { is_active: true }, order: { created_at: 'DESC' } });
  }

  async getFoundPets() {
    return await this.foundPetRepo.find({ order: { created_at: 'DESC' } });
  }

  private async sendMatchEmail(lostPet: any, foundData: any) {
    try {
      await this.transporter.sendMail({
        from: '"PetRadar Notifications" <tepozramses@gmail.com>',
        to: lostPet.owner_email || 'tepozramses@gmail.com',
        subject: '¡Buenas noticias! Posible coincidencia encontrada',
        html: `<div><h2>Posible coincidencia encontrada</h2><p>Nombre: ${foundData.finder_name}</p></div>`,
      });
    } catch (error) {
      console.error('Email error:', error.message);
    }
  }
}