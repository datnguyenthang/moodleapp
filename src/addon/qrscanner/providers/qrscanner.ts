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
import { CoreLoggerProvider } from '@providers/logger';
import { CoreSitesProvider } from '@providers/sites';
import { CoreSite } from '@classes/site';
import { ModalController, Modal } from 'ionic-angular';

@Injectable()
export class AddonQRScannerProvider {
    protected logger;
    protected modal: Modal;

    constructor(logger: CoreLoggerProvider, private sitesProvider: CoreSitesProvider, protected modalController: ModalController) {
        this.logger = logger.getInstance('AddonQRScannerProvider');
    }

    /**
     * Check if QRScanner is disabled in a certain site.
     *
     * @param {CoreSite} [site] Site. If not defined, use current site.
     * @return {boolean} Whether it's disabled.
     */
    isQRScannerDisabledInSite(site?: CoreSite): boolean {
        site = site || this.sitesProvider.getCurrentSite();

        return site.isFeatureDisabled('CoreMainMenuDelegate_AddonQRScanner');
    }

    /**
     * Check if QRScanner is disabled in a certain site.
     *
     * @param  {string} [siteId] Site Id. If not defined, use current site.
     * @return {Promise<boolean>}     Promise resolved with true if disabled, rejected or resolved with false otherwise.
     */
    isDisabled(siteId?: string): Promise<boolean> {
        return this.sitesProvider.getSite(siteId).then((site) => {
            return this.isQRScannerDisabledInSite(site);
        });
    }

    scan(validate: (text: any) => any = (text) => { return text; }) : Promise<any> { 
        this.modal = this.modalController.create('qrscanner', { validate: validate});
        this.modal.present();

        return new Promise<any>((resolve, reject) => {
            this.modal.onDidDismiss(data => {
                if (data && data.text) {
                    resolve(data.text);
                } else {
                    reject();
                }
            });
        });                        
    }

}
