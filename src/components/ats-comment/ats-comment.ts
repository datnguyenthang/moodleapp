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
 * <core-ats-comment></core-ats-comment>
 */
@Component({
    selector: 'core-ats-comment',
    templateUrl: 'core-ats-comment.html'
})
export class CoreATSCommentComponent implements OnInit, OnDestroy {
    @Input() module: any;
    @Input() courseId: number;

    protected isDestroyed = false;
    protected commentLoaded = false;
    protected isEnableComment = false;
    protected commentData: any;

    constructor(@Optional() protected navCtrl: NavController, protected prefetchDelegate: CoreCourseModulePrefetchDelegate,
            protected eventsProvider: CoreEventsProvider, protected sitesProvider: CoreSitesProvider,
            protected courseProvider: CoreCourseProvider, protected toastController: ToastController,
            protected translate: TranslateService) {
            this.commentData = { };
    }

    /**
     * Component being initialized.
     */
    ngOnInit(): void {
        
        console.log('===ngOnInit====');
        console.log('courseId: ' + this.courseId);
        console.log('moduleid: ' + this.module.id);
        
        // Check enable comment
        this.checkEnableComment();

        console.log('===ngOnInit====');
    }

    ngAfterViewInit():void {

    }
    
    /**
     * Component destroyed.
     */
    ngOnDestroy(): void {
        this.isDestroyed = true;
    }
    
    checkEnableComment(): Promise<void> {
        console.log('===checkEnableComment====');

        return this.getModuleSelect().then((modules) => {
            if (modules && modules.length > 0) {
                modules.forEach(item => {
                    if (item == this.module.id) {
                        this.isEnableComment = true;
                        this.getCommentData().then(data => {
                            this.commentLoaded = true;
                            if (data && data.length > 0) {
                                this.commentData = data[0];
                                console.log('commentData:' + this.commentData);
                            }
                        }).catch((error)=> {
                            console.log(error);
                        });
                        return this.isEnableComment;
                    }
                });
                console.log('isEnableComment: ' + this.isEnableComment);
                this.commentLoaded = true;
            } else {
                console.log('isEnableComment: ' + this.isEnableComment);
                this.commentLoaded = true;
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
            return site.read('block_course_rate_get_moduleselect', data, preSets);
        });
    }

    getCommentData(siteId?: string): Promise<any[]> {
        //console.log('===getCommentData====');

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

}
