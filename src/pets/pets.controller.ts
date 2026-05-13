import { Controller, Post, Body, Get, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { PetsService } from './pets.service';

@Controller()
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get('lost-pets')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300) // 5 minutes cache
  async getLostPets() {
    return this.petsService.getLostPets();
  }

  @Get('found-pets')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300) // 5 minutes cache
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