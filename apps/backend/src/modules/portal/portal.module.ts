import { Module } from "@nestjs/common";
import { PortalController } from "./portal.controller";
import { PortalRepository } from "./portal.repository";
import { PortalService } from "./portal.service";

@Module({
  controllers: [PortalController],
  providers: [PortalRepository, PortalService],
  exports: [PortalService, PortalRepository],
})
export class PortalModule {}
