import { Module } from '@nestjs/common';
import { MenuController } from '@/modules/menu/menu.controller';
import { MenuService } from '@/modules/menu/menu.service';
import { MenuItemRepository } from '@/modules/menu/menu-item.repository';

@Module({
    controllers: [MenuController],
    providers: [MenuService, MenuItemRepository],
    exports: [MenuService, MenuItemRepository],
})
export class MenuModule {}
