import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { TrackModule } from './track/track.module';
import { MarketModule } from './market/market.module';
import { FanModule } from './fan/fan.module';
import { CreatorModule } from './creator/creator.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MintingModule } from './minting/minting.module';
import { ListeningRoomModule } from './listening-room/listening-room.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    ProfileModule,
    TrackModule,
    MarketModule,
    FanModule,
    CreatorModule,
    AnalyticsModule,
    MintingModule,
    ListeningRoomModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
