import { Controller, Get } from "@nestjs/common";

@Controller()
export class HealthController {
  @Get()
  root() {
    return { status: "ok", service: "meteor-backend" };
  }

  @Get("health")
  health() {
    return { status: "ok", service: "meteor-backend" };
  }
}
