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
import { ModalController } from 'ionic-angular';
import { CoreLoggerProvider } from '@providers/logger';
import { CoreSitesProvider } from '@providers/sites';
import { CoreSite } from '@classes/site';
import { CoreCourseHelperProvider } from '@core/course/providers/helper';
import { CoreCoursesProvider } from '@core/courses/providers/courses';

@Injectable()
export class AddonLandingProvider {
    [x: string]: any;
    protected logger;
    static TYPE_MANDATORY_TRAINING = 1;
    static TYPE_SCHOOL_OF_SALES = 2;
    static TYPE_SCHOOL_OF_RECOVERY = 3;
    static TYPE_FE_ACADEMY = 4;
    static TYPE_MY_COURSE = 5;

    constructor(logger: CoreLoggerProvider, private sitesProvider: CoreSitesProvider,
        private coursesProvider: CoreCoursesProvider,
        private modalCtrl: ModalController) {
        this.logger = logger.getInstance('AddonLandingProvider');
    }

    /**
     * Check if Calendar is disabled in a certain site.
     *
     * @param {CoreSite} [site] Site. If not defined, use current site.
     * @return {boolean} Whether it's disabled.
     */
    isLandingDisabledInSite(site?: CoreSite): boolean {
        site = site || this.sitesProvider.getCurrentSite();

        return site.isFeatureDisabled('CoreMainMenuDelegate_AddonLanding');
    }

    /**
     * Check if Calendar is disabled in a certain site.
     *
     * @param  {string} [siteId] Site Id. If not defined, use current site.
     * @return {Promise<boolean>}     Promise resolved with true if disabled, rejected or resolved with false otherwise.
     */
    isDisabled(siteId?: string): Promise<boolean> {
        return this.sitesProvider.getSite(siteId).then((site) => {
            return this.isLandingDisabledInSite(site);
        });
    }

    getPopUpData(siteId?: string): Promise<any[]> {
        return this.sitesProvider.getSite(siteId).then((site) => {
            const data = {};

            const preSets = {
                getFromCache: false,
                saveToCache: false,
                emergencyCache: false,
            };

            return site.read('custom_popup_get_data', data, preSets);
        });
    }

    redirectPage(pageAddress: string): void {
        this.navCtrl.push(pageAddress);
    }


    initPopup(): void {
        this.getPopUpData().then((data) => {

            if (!data) return;

           const opts = {
            showBackdrop: true,
            enableBackdropDismiss: true,
            enterAnimation: '',
            leaveAnimation: '',
            cssClass: ''
           };
    
           const modal = this.modalCtrl.create('AddonLandingPopupPage', data, opts);

           modal.present();
        });
    }

    /**
     * Get user courses.
     *
     * @param {boolean} [preferCache] True if shouldn't call WS if data is cached, false otherwise.
     * @param {string} [siteId] Site to get the courses from. If not defined, use current site.
     * @return {Promise<any[]>} Promise resolved with the courses.
     */
    getUserCourses(preferCache?: boolean, siteId?: string, typeNum?: number): Promise<any[]> {
        return this.sitesProvider.getSite(siteId).then((site) => {

            const userId = site.getUserId(),
                data = {
                    userid: userId,
                    type: typeNum ? typeNum : null
                },
                preSets = {
                    cacheKey: 'mmCourses:usercourses',
                    omitExpires: !!preferCache
                };

            return site.read('theme_atstwo_enrol_get_users_courses', data, preSets);
        });
    }
}
