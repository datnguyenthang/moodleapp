// (C) Copyright 2015 Moodle Pty Ltd.
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

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, Optional } from '@angular/core';
import { NavController, NavParams, Item, ToastController } from 'ionic-angular';
import { CoreEventsProvider } from '@providers/events';
import { CoreSitesProvider } from '@providers/sites';
import { CoreCourseProvider } from '@core/course/providers/course';
import { CoreCourseModulePrefetchDelegate } from '@core/course/providers/module-prefetch-delegate';
import { TranslateService } from '@ngx-translate/core';

/**
 * Component to display a module entry in a list of modules.
 *
 * Example usage:
 *
 * <core-ats-rating></core-ats-rating>
 */
@Component({
    selector: 'core-ats-rating',
    templateUrl: 'core-ats-rating.html'
})
export class CoreATSRatingComponent implements OnInit, OnDestroy {
    @Input() module: any;
    @Input() courseId: number;

    protected isDestroyed = false;
    protected ratingLoaded = false;
    protected isEnableRating = false;
    protected userVote = 0;
    protected ratingData: any;
    protected totalRating = 0;
    protected averageRating = 0;
    protected isReadonly = false;
    protected classShowRatingDetail = '';

    constructor(@Optional() protected navCtrl: NavController, protected prefetchDelegate: CoreCourseModulePrefetchDelegate,
            protected eventsProvider: CoreEventsProvider, protected sitesProvider: CoreSitesProvider,
            protected courseProvider: CoreCourseProvider, protected toastController: ToastController,
            protected translate: TranslateService) {
            this.ratingData = { typeone: 0,
                typetwo: 0,
                typethree: 0,
                typefour: 0,
                typefive: 0
            };
    }

    /**
     * Component being initialized.
     */
    ngOnInit(): void {
        // Check enable rating
        this.checkEnableRating();
    }

    ngAfterViewInit():void {

    }
    
    /**
     * Component destroyed.
     */
    ngOnDestroy(): void {
        this.isDestroyed = true;
    }
    
    checkEnableRating(): Promise<void> {
        return this.getModuleSelect().then((modules) => {
            if (modules && modules.length > 0) {
                modules.forEach(item => {
                    if (item == this.module.id) {
                        this.isEnableRating = true;
                        this.getRatingData().then(data => {
                            this.ratingLoaded = true;
                            if (data && data.length > 0) {
                                this.ratingData = data[0];
                                this.userVote = this.ratingData.uservote;
                                this.totalRating = this.ratingData.total;
                                this.averageRating = (this.ratingData.typeone * 1 
                                                        + this.ratingData.typetwo * 2 
                                                        + this.ratingData.typethree * 3
                                                        + this.ratingData.typefour * 4
                                                        + this.ratingData.typefive * 5) / this.ratingData.total;
                                this.isReadonly = this.userVote > 0;
                            }
                            
                        }).catch((error)=> {
                            console.log(error);
                        });
                        return this.isEnableRating;
                    }
                });
                this.ratingLoaded = true;
            } else {
                this.ratingLoaded = true;
            }
        });
    }

    getModuleSelect(siteId?: string): Promise<any[]> {
        return this.sitesProvider.getSite(siteId).then((site) => {
            const data = {
                courseid: this.courseId
            };
            
            const preSets = {
                getFromCache: false,
                saveToCache: false,
                emergencyCache: false,
            };  
            return site.read('block_course_rate_get_moduleselect', data, preSets).catch((error) => {
                console.log(error);
            });
        });
    }

    getRatingData(siteId?: string): Promise<any[]> {
        return this.sitesProvider.getSite(siteId).then((site) => {
            const data = {
                userid: this.sitesProvider.getCurrentSiteUserId(),
                courseid: this.courseId,
                cmid: this.module.id
            };

            const preSets = {
                getFromCache: false,
                saveToCache: false,
                emergencyCache: false,
            };

            return site.read('block_course_rate_get_database', data, preSets).catch((error) => {
                console.log(error);
            });
        });
    }

    ratingChange(rating) {
        this.ratingLoaded = false;
        this.userVote = rating;
        this.submitRating().then((data) => {
            this.ratingLoaded = true;
            const toast = this.toastController.create({
                message: this.translate.instant('core.atsrating.submitsuccess'),
                duration: 5000
            });
            toast.present();

            this.getRatingData().then(data => {
                if (data.length > 0) {
                    this.ratingData = data[0];
                    this.userVote = this.ratingData.uservote;
                    this.totalRating = this.ratingData.total;
                    this.averageRating = (this.ratingData.typeone * 1 
                                            + this.ratingData.typetwo * 2 
                                            + this.ratingData.typethree * 3
                                            + this.ratingData.typefour * 4
                                            + this.ratingData.typefive * 5) / this.ratingData.total;
                    this.isReadonly = this.userVote > 0;
                }
            }).catch((error)=> {
                console.log(error);
            });
        });
    }

    submitRating(siteId?: string, rating ?: number): Promise<string> {
        return this.sitesProvider.getSite(siteId).then((site) => {

            var func = 'insert';

            if (this.ratingData && this.ratingData.uservote > 0) {
                func = 'update';
            } 
            
            const data = {
                func: func,
                userid: this.sitesProvider.getCurrentSiteUserId(),
                courseid: this.courseId,
                cmid: this.module.id,
                vote: this.userVote
            };

            const preSets = {
                getFromCache: false,
                saveToCache: false,
                emergencyCache: false,
            };

            return site.write('block_course_rate_update_db', data, preSets).catch((error) => {
                console.log(error);
            });
        });
    }

    showDetailClick() {
        if(this.classShowRatingDetail != '') {
            this.classShowRatingDetail = '';
        } else {
            this.classShowRatingDetail = 'show-detail';
        }
    }
}
