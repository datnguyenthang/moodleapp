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
import { IonicPage, Searchbar, NavController, AlertController, NavParams } from 'ionic-angular';
import { CoreCoursesProvider } from '@core/courses/providers/courses';
import { CoreDomUtilsProvider } from '@providers/utils/dom';
import { CoreUtilsProvider } from '@providers/utils/utils';
import { CoreSitesProvider } from '@providers/sites';
import { CoreEventsProvider } from '@providers/events';
import { CoreUserProvider } from '@core/user/providers/user';
import { DataService } from '@providers/data.service';
import { CoreAppProvider } from '@providers/app';
import { AddonBlockTimelineProvider } from '@addon/block/timeline/providers/timeline';
import { CoreCourseHelperProvider } from '@core/course/providers/helper';
import { CoreCourseOptionsDelegate } from '@core/course/providers/options-delegate';
import * as moment from 'moment';
import { CoreTabsComponent } from '@components/tabs/tabs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddonEvaluateProvider } from '../../providers/evaluate';
import { TranslateService } from '@ngx-translate/core';



/**
 * Page that displays the list of calendar events.
 */
@IonicPage({ segment: 'addon-evaluate-input-info' })
@Component({
    selector: 'page-addon-evaluate-input-info',
    templateUrl: 'input-info.html',
})
export class AddonEvaluateInputInfoPage implements OnInit, OnDestroy {
    @ViewChild(CoreTabsComponent) tabsComponent: CoreTabsComponent;
    @ViewChild('searchbar') searchbar: Searchbar;
    credForm: FormGroup;
    pageLoaded = false;
    siteName: string;
    siteUrl: string;
    evaluateCode: string;
    protected evaluateProvider: AddonEvaluateProvider;
    boxClass = '';
    scanSub: any;

    protected prefetchIconsInitialized = false;
    protected isDestroyed;
    protected updateSiteObserver;
    protected courseIds = '';
    
    constructor(private domUtils: CoreDomUtilsProvider,
            private coursesProvider: CoreCoursesProvider, private utils: CoreUtilsProvider,
            private myOverviewProvider: AddonBlockTimelineProvider, private sitesProvider: CoreSitesProvider,
            private courseHelper: CoreCourseHelperProvider, private courseOptionsDelegate: CoreCourseOptionsDelegate,
            private eventsProvider: CoreEventsProvider, private navCtrl: NavController, appProvider: CoreAppProvider, 
            evaluateProvider: AddonEvaluateProvider, fb: FormBuilder, private translate: TranslateService,
            public alertController: AlertController, navParams: NavParams, private data: DataService,
            private userProvider: CoreUserProvider) {
        
        this.evaluateProvider = evaluateProvider;
        this.loadSiteInfo();
        this.userProvider.getProfile(this.sitesProvider.getCurrentSiteUserId(), 1).then((user)=> {
            this.credForm.controls['fullname'].setValue(user.fullname);
            this.credForm.controls['email'].setValue(user.email);
        });
       
        this.credForm = fb.group({
            coursecode: ['', Validators.required],
            fullname: [''],
            email: [''],
            cmnd: ['']
        });
        this.boxClass = 'box box-bg';
        this.evaluateCode =  navParams.get('evaluateCode');
        this.credForm.controls['coursecode'].setValue(this.evaluateCode);  

        // this.events.subscribe('scanner:evaluateCode',(evaluateCode)=>{
        //     console.log(evaluateCode);
        //     this.credForm.controls['coursecode'].setValue(evaluateCode);  
        // });
    }

    /**
     * View loaded.
     */
    ionViewDidLoad(): void {
        // if (window['globalVariable'] && window['globalVariable'].evaluateCode) {
        //     // console.log(window['globalVariable'])
        //     this.credForm.controls['coursecode'].setValue(window['globalVariable'].evaluateCode);  
        //     window['globalVariable'].evaluateCode = '';
        // }
        // this.data.currentMessage.subscribe( (message) => {
        //     console.log(message);

        // });
        if (this.data.getOrigin() == 'scanner') {
            this.credForm.controls['coursecode'].setValue(this.data.getData());
        }
        this.pageLoaded = true;
    }

    ionViewWillEnter(): void {
        if (this.data.getOrigin() == 'scanner') {
            this.credForm.controls['coursecode'].setValue(this.data.getData());
        }
    }

    ionViewDidEnter(): void {
        if (this.data.getOrigin() == 'scanner') {
            this.credForm.controls['coursecode'].setValue(this.data.getData());
        }
    }


    focusInSelect(): void {
        this.boxClass = 'box';
    }
    focusOutSelect(): void {
        this.boxClass = 'box box-bg';
    }
    checkcode(): void {
        
        const coursecode = this.credForm.value.coursecode;
        const fullname = this.credForm.value.fullname;
        const email = this.credForm.value.email;
        const cmnd = this.credForm.value.cmnd;
        
        const modal = this.domUtils.showModalLoading();
        // Start the authentication process.
        this.evaluateProvider.checkCourseCode(null, coursecode).then((data) => {
            const status = Boolean(data['status']);
            if (status == true) {
                const detail = data['detail'];
                this.navCtrl.push('AddonEvaluateSubmitEvaluatePage', {coursecode, fullname, email, cmnd, detail});
            } else {
                this.domUtils.showErrorModal(this.translate.instant('addon.evaluate.messagecoursecodeinvalid'), true);
            }
            

        }).catch((error) => {
            this.domUtils.showErrorModal(error, true);
        }).finally (() => {
            modal.dismiss();
        });
        return;
    }
    
    /**
     * Load the site info.
     */
    protected loadSiteInfo(): void {
        this.siteName = this.sitesProvider.getCurrentSite().getInfo().sitename;
        this.siteUrl = this.sitesProvider.getCurrentSite().getInfo().siteurl;
    }
    /**
     * Component being initialized.
     */
    ngOnInit(): void {
        if (this.data.getOrigin() == 'scanner') {
            this.credForm.controls['coursecode'].setValue(this.data.getData());
        }
    }
    /**
     * Page destroyed.
     */
    ngOnDestroy(): void {
        this.isDestroyed = true;
        this.updateSiteObserver && this.updateSiteObserver.off();
    }
}
