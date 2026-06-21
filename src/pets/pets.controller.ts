import { Controller, Post, Body, Get } from '@nestjs/common';
import { PetsService } from './pets.service';

@Controller()
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get('lost-pets')
  async getLostPets() {
    return this.petsService.getLostPets();
  }

  @Get('found-pets')
  async getFoundPets() {
    return this.petsService.getFoundPets();
  }

  @Post('lost-pets')
  createLost(@Body() body: any) {
    return this.petsService.createLostPet(body);
  }

  @Post('found-pets')
  createFound(@Body() body: any) {
    return this.petsService.createFoundPet(body);
  }
}