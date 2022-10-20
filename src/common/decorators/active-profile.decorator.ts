import { SetMetadata } from '@nestjs/common';

export const REQUIRE_ACTIVE_PROFILE = 'active_profile';
export const HasActiveProfile = () => SetMetadata(REQUIRE_ACTIVE_PROFILE, true);
