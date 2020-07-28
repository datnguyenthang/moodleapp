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

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
/**
 * This component is meant to display a course for a list of courses with progress.
 *
 * Example usage:
 *
 * <core-courses-course-list-slide [category]="category">
 * </core-courses-course-list-slide>
 */
@Component({
    selector: 'core-courses-course-list-slide',
    templateUrl: 'core-courses-course-list-slide.html'
})
export class CoreCoursesCourseListSlideComponent implements OnInit, OnDestroy {
    @Input() categories: any; // The category to render.
    protected isDestroyed = false;
    protected courseStatusObserver;
    protected siteUpdatedObserver;
    /**
     * Component being initialized.
     */
    ngOnInit(): void {
        // Nothing here.
    }
    /**
     * Component destroyed.
     */
    ngOnDestroy(): void {
        this.isDestroyed = true;

        this.siteUpdatedObserver && this.siteUpdatedObserver.off();
        this.courseStatusObserver && this.courseStatusObserver.off();
    }
}
