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

import { NgModule } from '@angular/core';
import { AddonMandatoryProvider } from './providers/mandatory';
import { AddonMandatoryMainMenuHandler } from './providers/mainmenu-handler';
import { CoreMainMenuDelegate } from '@core/mainmenu/providers/delegate';
import { CoreInitDelegate } from '@providers/init';
import { CoreLoginHelperProvider } from '@core/login/providers/helper';
import { CoreUpdateManagerProvider } from '@providers/update-manager';



@NgModule({
    declarations: [
    ],
    imports: [
    ],
    providers: [
        AddonMandatoryProvider,
        AddonMandatoryMainMenuHandler
    ]
})
export class AddonMandatoryModule {
    constructor(mainMenuDelegate: CoreMainMenuDelegate, mandatoryHandler: AddonMandatoryMainMenuHandler,
            initDelegate: CoreInitDelegate, mandatoryProvider: AddonMandatoryProvider, loginHelper: CoreLoginHelperProvider,
            updateManager: CoreUpdateManagerProvider) {
        mainMenuDelegate.registerHandler(mandatoryHandler);
    }
}
