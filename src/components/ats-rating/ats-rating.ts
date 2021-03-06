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
import { NavController, NavParams, Item, ToastController, AlertController } from 'ionic-angular';
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
    protected iconShowdetail = 'ios-arrow-down';
    protected contextid = 0;
    protected commentText = '';
    protected commentId = 0;

    constructor(@Optional() protected navCtrl: NavController, protected prefetchDelegate: CoreCourseModulePrefetchDelegate,
            protected eventsProvider: CoreEventsProvider, protected sitesProvider: CoreSitesProvider,
            protected courseProvider: CoreCourseProvider, protected toastController: ToastController,
            protected translate: TranslateService, protected alertController: AlertController) {
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
                        this.getCommentData().then(data => {
                            if (data) {
                                this.contextid = data.contextid;
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

    getCommentData(siteId?: string): Promise<any> {
        return this.sitesProvider.getSite(siteId).then((site) => {
            const data = {
                courseid: this.courseId,
                cmid: this.module.id,
                pagenumber: -1
            };

            const preSets = {
                getFromCache: false,
                saveToCache: false,
                emergencyCache: false,
            };

            return site.read('block_socialcomments_ats_get_commentspage', data, preSets).catch((error) => {
                console.log(error);
            });
        });
    }

    ratingChange(rating) {
        this.ratingLoaded = false;
        this.userVote = rating;
        if (this.userVote <= 3) {
            const alert = this.alertController.create({
                title: this.translate.instant('components.ats-rating.commenttitle'),
                message: this.translate.instant('components.ats-rating.commentmessage'),
                enableBackdropDismiss: false,
                inputs: [
                    {
                        name: 'txtComment',
                        id: 'txtComment',
                        type: 'textarea',
                        placeholder: this.translate.instant('components.ats-comment.text.writecomment')
                    }
                ],
                buttons: [
                    {
                        text: this.translate.instant('core.cancel'),
                        role: 'cancel',
                        cssClass: 'secondary',
                        handler: () => {
                            this.ratingLoaded = true;
                            this.userVote = 0;
                        }
                    }, 
                    {
                        text: this.translate.instant('core.submit'),
                        handler: (data) => {
                            if (data.txtComment.length < 20) {
                                return false;
                            }
                            this.commentText = data.txtComment;
                            this.postComment().then(data => {
                                if (data) {
                                    this.commentId = data.id;
                                    this.submitRating().then((data) => {
                                        this.ratingLoaded = true;
                                        this.checkEnableRating();
                                        const toast = this.toastController.create({
                                            message: this.translate.instant('components.ats-rating.label.submitsuccess'),
                                            duration: 5000
                                        });
                                        toast.present();
                                    });
                                }
                            }).catch((error) => {
                                console.log(error);
                            });;
                            this.ratingLoaded = true;
                        }
                    }
                ]
            });
            alert.present();
        } else {
            this.submitRating().then((data) => {
                this.ratingLoaded = true;
                const toast = this.toastController.create({
                    message: this.translate.instant('components.ats-rating.label.submitsuccess'),
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
    
                        this.averageRating = Math.round(this.averageRating * 10)/10;
                        this.isReadonly = this.userVote > 0;
                    }
                }).catch((error)=> {
                    console.log(error);
                });
            });
        }
        
    }

    submitRating(siteId?: string, rating ?: number): Promise<string> {
        return this.sitesProvider.getSite(siteId).then((site) => {

            var func = 'insert';

            if (this.ratingData && this.ratingData.uservote > 0) {
                func = 'update';
            }

            var data = {
                func: func,
                userid: this.sitesProvider.getCurrentSiteUserId(),
                courseid: this.courseId,
                cmid: this.module.id,
                vote: this.userVote,
                commentid: 0
            };

            if (this.commentId > 0) {
                data = {
                    func: func,
                    userid: this.sitesProvider.getCurrentSiteUserId(),
                    courseid: this.courseId,
                    cmid: this.module.id,
                    vote: this.userVote,
                    commentid: this.commentId
                };
            }

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

    postComment(siteId?: string): Promise<any> {
        return this.sitesProvider.getSite(siteId).then((site) => {
            const data = {
                contextid: this.contextid,
                content: this.commentText,
                groupid: 0,
                id: 0
            };

            const preSets = {
                getFromCache: false,
                saveToCache: false,
                emergencyCache: false,
            };

            return site.read('block_socialcomments_save_comment', data, preSets).catch((error) => {
                console.log(error);
            });
        });
    }

    showDetailClick() {
        if (this.classShowRatingDetail != '') {
            this.classShowRatingDetail = '';
            this.iconShowdetail = 'ios-arrow-down';
        } else {
            this.classShowRatingDetail = 'show-detail';
            this.iconShowdetail = 'ios-arrow-up';
        }
    }
}
