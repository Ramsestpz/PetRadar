import { Controller, Post, Body } from '@nestjs/common';
import { PetsService } from './pets.service';

@Controller()
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post('lost-pets')
  createLost(@Body() body: any) {
    return this.petsService.createLostPet(body);
  }

  @Post('found-pets')
  createFound(@Body() body: any) {
    return this.petsService.createFoundPet(body);
  }
}