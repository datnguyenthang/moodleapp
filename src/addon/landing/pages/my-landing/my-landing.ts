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

import { Component, ViewChild, OnDestroy } from '@angular/core';
import { IonicPage, Searchbar, NavController } from 'ionic-angular';
import { CoreSitesProvider } from '@providers/sites';
import { CoreAppProvider } from '@providers/app';
import { CoreTabsComponent } from '@components/tabs/tabs';
import { AddonLandingProvider } from '../../providers/landing';
import { CoreDomUtilsProvider } from '@providers/utils/dom';
import { CoreMainMenuProvider } from '@core/mainmenu/providers/mainmenu';
import { CoreMainMenuHandlerData, CoreMainMenuDelegate } from '@core/mainmenu/providers/delegate';

/**
 * Page this show up about FE School.
 */
@IonicPage({ segment: 'addon-landing-index' })
@Component({
    selector: 'page-addon-landing-my-landing',
    templateUrl: 'my-landing.html',
    
})
export class AddonLandingMyLandingPage implements OnDestroy {
    @ViewChild(CoreTabsComponent) tabsComponent: CoreTabsComponent;
    @ViewChild('searchbar') searchbar: Searchbar;

    siteName: string;
    landingLoaded = false;

    protected isDestroyed;
    protected subscription;

    protected sliders: any;
    protected slideDatas: any;

    handlersLoaded: any;
    handlers: CoreMainMenuHandlerData[];

    constructor(private menuDelegate: CoreMainMenuDelegate, private sitesProvider: CoreSitesProvider, private landingProvider: AddonLandingProvider,
                private navCtrl: NavController, private domUtils: CoreDomUtilsProvider) {
        this.loadSiteName();
        this.landingProvider.initPopup();
        this.landingProvider.getSlideData().then(result => {
            this.sliders = result;
            this.slideDatas = this.sliders.data;
        });
    }
    /**
     * Go to specific page.
     */
    openCataloguePage(pageAddress: string): void {
        this.navCtrl.push(pageAddress);
    }
    /**
     * Go to search courses.
     */
    openSearch(): void {
        this.navCtrl.push('CoreCoursesSearchPage');
    }
    /**
     * Load the site name.
     */
    protected loadSiteName(): void {
        this.siteName = this.sitesProvider.getCurrentSite().getInfo().sitename;
    }
    /**
     * Page destroyed.
     */
    ngOnDestroy(): void {
        this.isDestroyed = true;
    }
    /**
     * Refresh the data.
     *
     * @param  {any} [refresher] Refresher.
     * @return {Promise<any>} Promise resolved when done.
     */
    doRefresh(refresher?: any): void {
        this.landingProvider.initPopup();
        this.loadCustomHandler();
        this.loadSlideData();
        refresher.complete();
    }
    /**
     * View loaded.
     */
    ionViewDidLoad(): void {
        this.landingLoaded = true;
        this.loadCustomHandler();
        this.loadSlideData();
    }

    loadCustomHandler(): void {
        console.log('load Custom Handler');
        // Load the handlers.
        this.subscription = this.menuDelegate.getHandlers().subscribe((handlers) => {
            // Calculate the main handlers to not display them in this view.
            const mainHandlers = handlers.filter((handler) => {
                return !handler.onlyInMore;
            }).slice(0, CoreMainMenuProvider.NUM_MAIN_HANDLERS);

            // Get only the handlers that don't appear in the main view.
            this.handlers = [];

            handlers.forEach((handler) => {
                if (mainHandlers.indexOf(handler) == -1) {
                    this.handlers.push(handler);
                }
            });

            this.handlersLoaded = this.menuDelegate.areHandlersLoaded();
        });
    }

    loadSlideData(): void {
        this.landingProvider.getSlideData().then(result => {
            this.sliders = result;
            this.slideDatas = this.sliders.data;
        });
    }

    /**
     * Open a handler.
     *
     * @param {CoreMainMenuHandlerData} handler Handler to open.
     */
    openHandler(handler: CoreMainMenuHandlerData): void {
        this.navCtrl.push(handler.page, handler.pageParams);
    }
}
