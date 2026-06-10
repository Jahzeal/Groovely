import { Module } from '@nestjs/common';
import { MintingController } from './minting.controller';
import { MintingService } from './minting.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MintingController],
  providers: [MintingService],
  exports: [MintingService],
})
export class MintingModule {}
