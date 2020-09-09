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
import { CoreCoursesProvider } from '@core/courses/providers/courses';
import { CoreDomUtilsProvider } from '@providers/utils/dom';
import { CoreUtilsProvider } from '@providers/utils/utils';
import { CoreSitesProvider } from '@providers/sites';
import { CoreEventsProvider } from '@providers/events';
import { CoreAppProvider } from '@providers/app';
import { AddonBlockTimelineProvider } from '@addon/block/timeline/providers/timeline';
import { CoreCourseHelperProvider } from '@core/course/providers/helper';
import { CoreCourseOptionsDelegate } from '@core/course/providers/options-delegate';
import * as moment from 'moment';
import { CoreTabsComponent } from '@components/tabs/tabs';
import { AddonLandingProvider } from '@addon/landing/providers/landing';

/**
 * Page that displays the list of calendar events.
 */
@IonicPage({ segment: 'addon-feacademy-my-feacademy' })
@Component({
    selector: 'page-addon-feacademy-my-feacademy',
    templateUrl: 'my-feacademy.html',
})
export class AddonFeAcademyMyFeAcademyPage implements OnDestroy {
    @ViewChild(CoreTabsComponent) tabsComponent: CoreTabsComponent;
    @ViewChild('searchbar') searchbar: Searchbar;

    courses = {
        selected: 'inprogress',
        loaded: false,
        filter: '',
        past: [],
        inprogress: [],
        future: []
    };
    tabShown = 'courses';
    showFilter = false;
    filteredCourses: any[];
    filteredCategory: any[];
    searchEnabled: boolean;
    downloadAllCoursesEnabled: boolean;
    siteName: string;
    timeline = {
        sort: 'sortbydates',
        events: [],
        loaded: false,
        canLoadMore: undefined
    };
    timelineCourses = {
        courses: [],
        loaded: false,
        canLoadMore: false
    };
    prefetchCoursesData = {
        inprogress: {},
        past: {},
        future: {}
    };

    imageUrl = '';
    isUnderConstruction = false;

    protected prefetchIconsInitialized = false;
    protected isDestroyed;
    protected updateSiteObserver;
    protected courseIds = '';

    constructor(private domUtils: CoreDomUtilsProvider,
            private landingProvider: AddonLandingProvider,
            private coursesProvider: CoreCoursesProvider, private utils: CoreUtilsProvider,
            private myOverviewProvider: AddonBlockTimelineProvider, private sitesProvider: CoreSitesProvider,
            private courseHelper: CoreCourseHelperProvider, private courseOptionsDelegate: CoreCourseOptionsDelegate,
            private eventsProvider: CoreEventsProvider, private navCtrl: NavController, appProvider: CoreAppProvider) {
        this.loadSiteName();
    }

    /**
     * View loaded.
     */
    ionViewDidLoad(): void {
        this.searchEnabled = !this.coursesProvider.isSearchCoursesDisabledInSite();
        this.downloadAllCoursesEnabled = !this.coursesProvider.isDownloadCoursesDisabledInSite();

        // Refresh the enabled flags if site is updated.
        this.updateSiteObserver = this.eventsProvider.on(CoreEventsProvider.SITE_UPDATED, () => {
            const wasEnabled = this.downloadAllCoursesEnabled;

            this.searchEnabled = !this.coursesProvider.isSearchCoursesDisabledInSite();
            this.downloadAllCoursesEnabled = !this.coursesProvider.isDownloadCoursesDisabledInSite();

            if (!wasEnabled && this.downloadAllCoursesEnabled && this.courses.loaded) {
                // Download all courses is enabled now, initialize it.
                this.initPrefetchCoursesIcons();
            }

            this.loadSiteName();
        });

        if (!this.courses.loaded) {
            this.fetchMyOverviewCourses().finally(() => {
                this.courses.loaded = true;
            });
        }
    }

    /**
     * Fetch the timeline.
     *
     * @param {number} [afterEventId] The last event id.
     * @return {Promise<any>} Promise resolved when done.
     */
    protected fetchMyOverviewTimeline(afterEventId?: number): Promise<any> {
        return this.myOverviewProvider.getActionEventsByTimesort(afterEventId).then((events) => {
            this.timeline.events = events.events;
            this.timeline.canLoadMore = events.canLoadMore;
        }).catch((error) => {
            this.domUtils.showErrorModalDefault(error, 'Error getting my overview data.');
        });
    }
    /**
     * Go to search courses.
     */
    openSearch(): void {
        this.navCtrl.push('CoreCoursesSearchPage');
    }
    /**
     * Fetch the timeline by courses.
     *
     * @return {Promise<any>} Promise resolved when done.
     */
    protected fetchMyOverviewTimelineByCourses(): Promise<any> {
        return this.fetchUserCourses().then((courses) => {
            const today = moment().unix();
            let courseIds;
            courses = courses.filter((course) => {
                return course.startdate <= today && (!course.enddate || course.enddate >= today);
            });

            this.timelineCourses.courses = courses;
            if (courses.length > 0) {
                courseIds = courses.map((course) => {
                    return course.id;
                });

                return this.myOverviewProvider.getActionEventsByCourses(courseIds).then((courseEvents) => {
                    this.timelineCourses.courses.forEach((course) => {
                        course.events = courseEvents[course.id].events;
                        course.canLoadMore = courseEvents[course.id].canLoadMore;
                    });
                });
            }
        }).catch((error) => {
            this.domUtils.showErrorModalDefault(error, 'Error getting my overview data.');
        });
    }
    /**
     * Show or hide the filter.
     */
    switchFilter(): void {
        this.showFilter = !this.showFilter;
        this.courses.filter = '';
        this.filteredCourses = this.courses[this.courses.selected];
        if (this.showFilter) {
            setTimeout(() => {
                this.searchbar.setFocus();
            });
        }
    }
    /**
     * Fetch the courses for my overview.
     *
     * @return {Promise<any>} Promise resolved when done.
     */
    protected fetchMyOverviewCourses(): Promise<any> {
        return this.fetchUserCourses().then((courses) => {
            const today = moment().unix(),
                categoryList = [];
            this.courses.past = [];
            this.courses.inprogress = [];
            this.courses.future = [];

            courses.forEach((course) => {
                if (course.startdate > today) {
                    // Courses that have not started yet.
                    this.courses.future.push(course);
                } else if (course.enddate && course.enddate < today) {
                    // Courses that have already ended.
                    this.courses.past.push(course);
                } else {
                    // Courses still in progress.
                    this.courses.inprogress.push(course);
                }
                if (!categoryList.find((el) => { return el.id == course.category; })) {
                    categoryList.push({ id: course.category, 
                                        name: course.categoryname, 
                                        description: course.categorydescription, 
                                        courses: [] });
                }
            });
            categoryList.forEach((category) => {
                courses.forEach((course) => {
                    if (category.id == course.category) {
                        category.courses.push(course);
                    }
                });
            });
            
            this.filteredCategory = categoryList;
            
            // NGHE-TC: select firt category
            if(this.filteredCategory.length > 0) {
                this.filteredCategory[0].selected = true;
            }
            //==========================

            this.courses.filter = '';
            this.showFilter = false;
            this.filteredCourses = this.courses[this.courses.selected];

            this.initPrefetchCoursesIcons();
        }).catch((error) => {
            this.domUtils.showErrorModalDefault(error, 'Error getting my overview data.');
        });
    }

    /**
     * Fetch user courses.
     *
     * @return {Promise<any>} Promise resolved when done.
     */
    protected fetchUserCourses(): Promise<any> {
        return this.landingProvider.getUserCourses(null, null, AddonLandingProvider.TYPE_FE_ACADEMY).then((courses) => {
            
            // NGHE-TC: hide feacademy
            if (courses) {
                if (courses[0].underconstruction) {
                    this.isUnderConstruction = true;
                    this.imageUrl = courses[0].imageurl;
                    courses = [];
                    return courses;
                }
            }
            // ============
            
            const promises = [],
                courseIds = courses.map((course) => {
                return course.id;
            });

            if (this.coursesProvider.canGetAdminAndNavOptions()) {
                // Load course options of the course.
                promises.push(this.coursesProvider.getCoursesAdminAndNavOptions(courseIds).then((options) => {
                    courses.forEach((course) => {
                        course.navOptions = options.navOptions[course.id];
                        course.admOptions = options.admOptions[course.id];
                    });
                }));
            }

            this.courseIds = courseIds.join(',');

            if (this.courseIds && this.coursesProvider.isGetCoursesByFieldAvailable()) {
                // Load course image of all the courses.
                promises.push(this.coursesProvider.getCoursesByField('ids', this.courseIds).then((coursesInfo) => {
                    coursesInfo = this.utils.arrayToObject(coursesInfo, 'id');
                    courses.forEach((course) => {
                        if (coursesInfo[course.id] && coursesInfo[course.id].overviewfiles &&
                                coursesInfo[course.id].overviewfiles[0]) {
                            course.imageThumb = coursesInfo[course.id].overviewfiles[0].fileurl;
                        } else {
                            course.imageThumb = false;
                        }
                    });
                }));
            }

            return courses;
        });
    }
    /**
     * Initialize the prefetch icon for selected courses.
     */
    protected initPrefetchCoursesIcons(): void {
        if (this.prefetchIconsInitialized || !this.downloadAllCoursesEnabled) {
            // Already initialized.
            return;
        }

        this.prefetchIconsInitialized = true;

        Object.keys(this.prefetchCoursesData).forEach((filter) => {
            if (!this.courses[filter] || this.courses[filter].length < 2) {
                // Not enough courses.
                this.prefetchCoursesData[filter].icon = '';

                return;
            }

            this.courseHelper.determineCoursesStatus(this.courses[filter]).then((status) => {
                let icon = this.courseHelper.getCourseStatusIconAndTitleFromStatus(status).icon;
                if (icon == 'spinner') {
                    // It seems all courses are being downloaded, show a download button instead.
                    icon = 'cloud-download';
                }
                this.prefetchCoursesData[filter].icon = icon;
            });

        });
    }

    /**
     * Refresh the data.
     *
     * @param {any} refresher Refresher.
     * @return {Promise<any>} Promise resolved when done.
     */
    refreshMyOverview(refresher: any): Promise<any> {
        const promises = [];

        if (this.tabShown == 'timeline') {
            promises.push(this.myOverviewProvider.invalidateActionEventsByTimesort());
            promises.push(this.myOverviewProvider.invalidateActionEventsByCourses());
        }

        promises.push(this.coursesProvider.invalidateUserCourses());
        promises.push(this.courseOptionsDelegate.clearAndInvalidateCoursesOptions());
        if (this.courseIds) {
            promises.push(this.coursesProvider.invalidateCoursesByField('ids', this.courseIds));
        }

        return Promise.all(promises).finally(() => {
            switch (this.tabShown) {
                case 'timeline':
                    switch (this.timeline.sort) {
                        case 'sortbydates':
                            return this.fetchMyOverviewTimeline();
                        case 'sortbycourses':
                            return this.fetchMyOverviewTimelineByCourses();
                        default:
                    }
                    break;
                case 'courses':
                    this.prefetchIconsInitialized = false;

                    return this.fetchMyOverviewCourses();
                default:
            }
        }).finally(() => {
            refresher.complete();
        });
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
        this.updateSiteObserver && this.updateSiteObserver.off();
    }
}
