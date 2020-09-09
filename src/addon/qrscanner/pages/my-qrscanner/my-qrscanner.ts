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
import { IonicPage, Searchbar, NavController, AlertController } from 'ionic-angular';
import { CoreUtilsProvider } from '@providers/utils/utils';
import { CoreSitesProvider } from '@providers/sites';
import { DataService } from '@providers/data.service';
import { CoreEventsProvider } from '@providers/events';
import { CoreAppProvider } from '@providers/app';
import { CoreTabsComponent } from '@components/tabs/tabs';
import { AddonQRScannerProvider } from '../../providers/qrscanner';
import { TranslateService } from '@ngx-translate/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

/**
 * Page that displays the list of calendar events.
 */
@IonicPage({ segment: 'addon-qrscanner' })
@Component({
    selector: 'page-addon-my-qrscanner',
    templateUrl: 'my-qrscanner.html',
})
export class AddonQRScannerPage implements OnDestroy {
    @ViewChild(CoreTabsComponent) tabsComponent: CoreTabsComponent;
    ionApp: any;
    ionicTabbar: any;

    protected qrscannerProvider: AddonQRScannerProvider;
    protected prefetchIconsInitialized = false;
    protected isDestroyed;
    protected updateSiteObserver;
    
    constructor(private utils: CoreUtilsProvider, private sitesProvider: CoreSitesProvider,
      private eventsProvider: CoreEventsProvider, private navCtrl: NavController, appProvider: CoreAppProvider, 
      private translate: TranslateService, public alertController: AlertController, private data: DataService,
      private barcodeScanner: BarcodeScanner) {}

    ionViewWillEnter(): void {
      this.scanQR();
    }
    exitPage(): void {
      this.navCtrl.setRoot("CoreLoginInitPage");
    }
    scanQR(): void {
      /*
      (window.document.querySelector('.closeCamera') as HTMLElement).classList.remove('hide');
      this.barcodeScanner.scan().then(barcodeData => {
        this.dataHandle(barcodeData.text);
      }).catch(err => {
        console.log('Error', err);
      });
      */
      //////////
      // Scan for a QR code.
      this.utils.scanQR().then((text) => {
          if (text) {
            this.dataHandle(text);
          }
      });
    }
    dataHandle(data: any): void {
      try {
        let obj = JSON.parse(data);
        if(this.checkDataHandle(obj)) {
          switch (obj.type) {
            case 'EVALUATE':
                this.data.setData(obj.value, "scanner");
                this.navCtrl.popToRoot();
                this.navCtrl.parent.select(2);
            break;
            case 'COURSE':
                this.navCtrl.push('CoreCourseSectionPage', { course: { id: obj.value } });
            break;
          }
        }
      } catch(e){

      }
    }
    checkDataHandle(obj: any): boolean {
      let result = false;
      const TeamplateData = {type: '', value: ''};
      for (const el in obj) {
        result = TeamplateData.hasOwnProperty(el);
      }

      return result;
    }
    /**
     * Page destroyed.
     */
    ngOnDestroy(): void {
        this.isDestroyed = true;
        this.updateSiteObserver && this.updateSiteObserver.off();
    }
}