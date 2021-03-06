// (C) Copyright 2015 Martin Dougiamas
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Injectable } from '@angular/core';
import { AddonSchoolOfRecoveryProvider } from './schoolofrecovery';
import { CoreMainMenuHandler, CoreMainMenuHandlerData } from '@core/mainmenu/providers/delegate';

/**
 * Handler to inject an option into main menu.
 */
@Injectable()
export class AddonSchoolOfRecoveryMainMenuHandler implements CoreMainMenuHandler {
    name = 'AddonSchoolOfRecovery';
    priority = 900;

    constructor(private schoolofrecoveryProvider: AddonSchoolOfRecoveryProvider) { }

    /**
     * Check if the handler is enabled on a site level.
     *
     * @return {boolean} Whether or not the handler is enabled on a site level.
     */
    isEnabled(): boolean | Promise<boolean> {
        return this.schoolofrecoveryProvider.isSchoolOfRecoveryDisabledInSite();
    }

    /**
     * Returns the data needed to render the handler.
     *
     * @return {CoreMainMenuHandlerData} Data needed to render the handler.
     */
    getDisplayData(): CoreMainMenuHandlerData {
        return {
            icon: 'school',
            title: 'addon.schoolofrecovery.schoolofrecovery',
            page: 'AddonSchoolOfRecoveryMySchoolOfRecoveryPage',
            class: 'addon-schoolofrecovery-handler'
        };
    }
}
