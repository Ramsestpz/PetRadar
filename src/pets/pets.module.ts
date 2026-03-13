import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetsService } from './pets.service';
import { PetsController } from './pets.controller';
import { LostPet } from './entities/lost-pet.entity';
import { FoundPet } from './entities/found-pet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LostPet, FoundPet])],
  controllers: [PetsController],
  providers: [PetsService],
})
export class PetsModule {}