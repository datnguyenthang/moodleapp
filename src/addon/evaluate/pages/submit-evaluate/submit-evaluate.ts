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
import { Component, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { IonicPage, Searchbar, NavController, NavParams } from 'ionic-angular';
import { CoreDomUtilsProvider } from '@providers/utils/dom';
import { CoreSitesProvider } from '@providers/sites';
import { CoreAppProvider } from '@providers/app';
import { CoreTabsComponent } from '@components/tabs/tabs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddonEvaluateProvider } from '../../providers/evaluate';
import { TranslateService } from '@ngx-translate/core';
import { App } from 'ionic-angular/components/app/app';
import { StarRatingModule } from 'ionic3-star-rating';

/**
 * Page that displays the list of calendar events.
 */
@IonicPage({ segment: 'addon-evaluate-submit-evaluate' })
@Component({
    selector: 'page-addon-evaluate-submit-evaluate',
    templateUrl: 'submit-evaluate.html',
})
export class AddonEvaluateSubmitEvaluatePage implements OnInit, OnDestroy {
    @ViewChild(CoreTabsComponent) tabsComponent: CoreTabsComponent;
    @ViewChild('searchbar') searchbar: Searchbar;
    credForm: FormGroup;
    pageLoaded = false;
    siteName: string;
    siteUrl: string;
    protected evaluateProvider: AddonEvaluateProvider;
    coursecode: string;
    fullname: string;
    email: string;
    cmnd: string;
    evaluateQuestion: any;
    
    protected isDestroyed;
    protected updateSiteObserver;
    protected courseIds = '';

    constructor(private domUtils: CoreDomUtilsProvider, private sitesProvider: CoreSitesProvider,
            private navCtrl: NavController, appProvider: CoreAppProvider, 
            fb: FormBuilder, navParams: NavParams, evaluateProvider: AddonEvaluateProvider,
            private translate: TranslateService, private app: App) {
        this.loadSiteInfo();
        this.evaluateProvider = evaluateProvider;
        this.coursecode = navParams.get('coursecode');
        this.fullname = navParams.get('fullname');
        this.email = navParams.get('email');
        this.cmnd = navParams.get('cmnd');
        this.evaluateQuestion = JSON.parse(navParams.get('detail'));
    }

    /**
     * View loaded.
     */
    ionViewDidLoad(): void {
        this.pageLoaded = true;
    }

    submitEvaluate(): void {
        const evaluateInfo = { 'event_id' : this.evaluateQuestion['courseid'],
                                'fullname' : this.fullname,
                                'email': this.email,
                                'cmnd': this.cmnd
                            };
        const points = new Array();
        this.evaluateQuestion['questions']['type1'].forEach((value) => {
            const submitPoint = (5 - document.getElementById('rating_' + value.id).querySelectorAll('.ion-ios-star-outline').length);
            const point = value.id + '_' + submitPoint + '_';
            points.push(point);
        });

        this.evaluateQuestion['questions']['type2'].forEach((value) => {
            const submitPoint = (5 - document.getElementById('rating_' + value.id).querySelectorAll('.ion-ios-star-outline').length);
            const point = value.id + '_' + submitPoint + '_' + value.trainer_id;
            points.push(point);
        });

        const comments = new Array();
        this.evaluateQuestion['questions']['type3'].forEach((value) => {
            const commentid = 'comment_' + value.id;
            const commentvalue = document.getElementById(commentid).querySelector('textarea').value;
            comments.push( { 'id' : value.id, 'content' : commentvalue } );
        });

        const evaluateDetail = { 'point' : points, 'comment' : comments };

        const submitData = { 'evaluate_info' : evaluateInfo, 'evaluate_detail' : evaluateDetail };
        const submitDataJson = JSON.stringify(submitData);
        // console.log(submitData);
        // console.log(submitDataJson);
        const modal = this.domUtils.showModalLoading();
        // Start the authentication process.
        this.evaluateProvider.submitEvaluateCourse(null, submitDataJson).then((data) => {
            const status = Boolean(data['status']);
            if (status == true) {
                this.domUtils.showAlert(this.translate.instant('addon.evaluate.alerttitle'),
                                        this.translate.instant('addon.evaluate.messagesubmitsuccess'),
                                        this.translate.instant('addon.evaluate.btnok'));
                this.navCtrl.popToRoot();
                this.navCtrl.parent.select(1);
                // this.navCtrl.setRoot("CoreLoginInitPage"); 
                                        
            } else {
                this.domUtils.showErrorModal(this.translate.instant('addon.evaluate.messagesubmitfailed'), true);
            }
            
        }).catch((error) => {

            this.domUtils.showErrorModal(error, true);
        }).finally (() => {
            
            modal.dismiss();
        });

        return;
    }
    /**
     * Component being initialized.
     */
    ngOnInit(): void {}
    /**
     * Load the site info.
     */
    protected loadSiteInfo(): void {
        this.siteName = this.sitesProvider.getCurrentSite().getInfo().sitename;
        this.siteUrl = this.sitesProvider.getCurrentSite().getInfo().siteurl;
    }
    /**
     * Page destroyed.
     */
    ngOnDestroy(): void {
        this.isDestroyed = true;
        this.updateSiteObserver && this.updateSiteObserver.off();
    }
}
