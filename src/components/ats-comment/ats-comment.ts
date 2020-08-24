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

import { Component, Input, OnInit, OnDestroy, Optional, ViewChild } from '@angular/core';
import { NavController, ToastController, TextInput, ViewController, Content } from 'ionic-angular';
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
    @ViewChild('txtComment') txtComment:TextInput;
    @ViewChild(Content) content: Content;


    protected isDestroyed = false;
    protected commentLoaded = false;
    protected isEnableComment = false;
    protected commentData: any;
    protected commentText = '';
    protected contextid = 0;
    protected commentspage: any;
    protected comments: any;
    protected listPost = [];
    protected postReplied: any;
    protected replyClass = '';
    protected txtCommentClass = '';

    constructor(@Optional() protected navCtrl: NavController, protected prefetchDelegate: CoreCourseModulePrefetchDelegate,
            protected eventsProvider: CoreEventsProvider, protected sitesProvider: CoreSitesProvider,
            protected courseProvider: CoreCourseProvider, protected toastController: ToastController,
            protected translate: TranslateService) {
            
            this.postReplied = {
                postid: 0
            }
    }

    /**
     * Component being initialized.
     */
    ngOnInit(): void {
        // Check enable comment
        this.checkEnableComment();
    }
    
    /**
     * Component destroyed.
     */
    ngOnDestroy(): void {
        this.isDestroyed = true;
    }
    
    checkEnableComment(): Promise<void> {
        return this.getCommentData().then(data => {
            this.commentLoaded = true;
            if (data) {
                this.commentData = data;
                this.contextid = this.commentData.contextid;
                if (this.contextid > 0) {
                    this.isEnableComment = true;
                    this.commentspage = JSON.parse(this.commentData.commentspage);
                    this.comments = this.commentspage.comments;
                    
                    for (var key in this.comments.posts) {
                        var listReply = this.comments.posts[key].replies;
                        var arrReply = [];
                        for (var key2 in listReply) {
                            arrReply.push(listReply[key2]);
                        }
                        this.comments.posts[key].replies = arrReply;
                        this.listPost.push(this.comments.posts[key]);
                    }
                }
            }
        }).catch((error)=> {
            console.log(error);
            this.commentLoaded = true;
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

    sendCommentClick() {
        var commentvalue = document.getElementById('txtComment').querySelector('textarea').value;
        if (commentvalue == '') {
            return;
        }

        this.commentLoaded = false;
        this.commentText = commentvalue;

        if (this.postReplied.postid > 0) {
            return this.postReplyComment().then(data => {
                if(data) {
                    this.listPost = [];
                    this.commentText = '';
                    this.postReplied.postid = 0;
                    this.replyClass = '';
                    this.checkEnableComment();
                }
                this.commentLoaded = true;
            }).catch((error) => {
                console.log(error);
            });
        } else {
            return this.postComment().then(data => {
                if (data) {
                    this.listPost = [];
                    this.commentText = '';
                    this.checkEnableComment();
                    this.content.scrollToBottom();
                }
                this.commentLoaded = true;
            }).catch((error) => {
                console.log(error);
            });
        }
        
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

    postReplyComment(siteId?: string): Promise<any> {
        return this.sitesProvider.getSite(siteId).then((site) => {
            const data = {
                contextid: this.contextid,
                content: this.commentText,
                commentid: this.postReplied.postid,
                id: 0
            };

            const preSets = {
                getFromCache: false,
                saveToCache: false,
                emergencyCache: false,
            };

            return site.read('block_socialcomments_save_reply', data, preSets).catch((error) => {
                console.log(error);
            });
        });
    }

    replyClick(post?: any) {
        this.postReplied = post;
        this.replyClass = 'block-input-reply-comment';
        this.txtComment.setFocus();
    }

    closeReplyClick() {
        this.postReplied = { postid: 0 };
        this.commentText = '';
        this.replyClass = '';
        this.txtCommentClass = '';
    }

    txtCommentFocus() {
        this.txtCommentClass = 'txt-comment-focus';
    }
    txtCommentBlur() {
        this.txtCommentClass = '';
    }
}
