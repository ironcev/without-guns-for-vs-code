// The example is compiled out of the following open source files:
// - vscode/src/vs/workbench/common/theme.ts (https://github.com/Microsoft/vscode/blob/35b91522e736711680a558a7d801f30b5b69b039/src/vs/workbench/common/theme.ts)
// - angular/aio/src/app/app.component.ts (https://github.com/angular/angular/blob/7c5ecb5b5c13b24b1a86c9bd5bb74b709dc2a6e8/aio/src/app/app.component.ts)

import nls = require('vs/nls');
import { registerColor, editorBackground, contrastBorder, transparent, lighten, darken } from 'vs/platform/theme/common/colorRegistry';
import { IDisposable, Disposable, dispose } from 'vs/base/common/lifecycle';
import { IThemeService, ITheme } from 'vs/platform/theme/common/themeService';
import { Color } from 'vs/base/common/color';

// < --- Tabs --- >

export const TAB_ACTIVE_BACKGROUND = registerColor('tab.activeBackground', {
	dark: editorBackground,
	light: editorBackground,
	hc: editorBackground
}, nls.localize('tabActiveBackground', "Active tab background color. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_INACTIVE_BACKGROUND = registerColor('tab.inactiveBackground', {
	dark: '#2D2D2D',
	light: '#ECECEC',
	hc: null
}, nls.localize('tabInactiveBackground', "Inactive tab background color. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_BORDER = registerColor('tab.border', {
	dark: '#252526',
	light: '#F3F3F3',
	hc: contrastBorder
}, nls.localize('tabBorder', "Border to separate tabs from each other. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_ACTIVE_BORDER = registerColor('tab.activeBorder', {
	dark: null,
	light: null,
	hc: null
}, nls.localize('tabActiveBorder', "Border to highlight active tabs. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

/**
 * Base class for all themable workbench components.
 */
export class Themable extends Disposable {
	private _toUnbind: IDisposable[];
	private theme: ITheme;

	constructor(
		protected themeService: IThemeService
	) {
		super();

		this._toUnbind = [];
		this.theme = themeService.getTheme();

		// Hook up to theme changes
		this._toUnbind.push(this.themeService.onThemeChange(theme => this.onThemeChange(theme)));
	}

	protected get toUnbind() {
		return this._toUnbind;
	}

	protected onThemeChange(theme: ITheme): void {
		this.theme = theme;

		this.updateStyles();
	}

	protected updateStyles(): void {
		// Subclasses to override
	}

	protected getColor(id: string, modify?: (color: Color, theme: ITheme) => Color): string {
		let color = this.theme.getColor(id);

		if (color && modify) {
			color = modify(color, this.theme);
		}

		return color ? color.toString() : null;
	}

	public dispose(): void {
		this._toUnbind = dispose(this._toUnbind);

		super.dispose();
	}
}

const sideNavView = 'SideNav';

@Component({
	selector: 'aio-shell',
	templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {

	currentDocument: DocumentContents;
	currentDocVersion: NavigationNode;
	currentNodes: CurrentNodes;
	currentPath: string;
	docVersions: NavigationNode[];
	dtOn = false;
	footerNodes: NavigationNode[];

	/**
	* An HTML friendly identifier for the currently displayed page.
	* This is computed from the `currentDocument.id` by replacing `/` with `-`
	*/
	pageId: string;
	/**
	* An HTML friendly identifer for the "folder" of the currently displayed page.
	* This is computed by taking everything up to the first `/` in the `currentDocument.id`
	*/
	folderId: string;
	/**
	* These CSS classes are computed from the current state of the application
	* (e.g. what document is being viewed) to allow for fine grain control over
	* the styling of individual pages.
	* You will get three classes:
	*
	* * `page-...`: computed from the current document id (e.g. events, guide-security, tutorial-toh-pt2)
	* * `folder-...`: computed from the top level folder for an id (e.g. guide, tutorial, etc)
	* * `view-...`: computef from the navigation view (e.g. SideNav, TopBar, etc)
	*/
	@HostBinding('class')
	hostClasses = '';

	isFetching = false;
	isStarting = true;
	isSideBySide = false;
	private isFetchingTimeout: any;
	private isSideNavDoc = false;

	private sideBySideWidth = 992;
	sideNavNodes: NavigationNode[];
	topMenuNodes: NavigationNode[];
	topMenuNarrowNodes: NavigationNode[];

	hasFloatingToc = true;
	private showFloatingToc = new BehaviorSubject(false);
	private showFloatingTocWidth = 800;
	tocMaxHeight: string;
	private tocMaxHeightOffset = 0;

	versionInfo: VersionInfo;

	get homeImageUrl() {
		return this.isSideBySide ?
			'assets/images/logos/angular/logo-nav@2x.png' :
			'assets/images/logos/angular/shield-large.svg';
	}
	get isOpened() { return this.isSideBySide && this.isSideNavDoc; }
	get mode() { return this.isSideBySide ? 'side' : 'over'; }

	// Need the doc-viewer element for scrolling the contents
	@ViewChild(DocViewerComponent, { read: ElementRef })
	docViewer: ElementRef;

	// Search related properties
	showSearchResults = false;
	@ViewChildren('searchBox, searchResults', { read: ElementRef })
	searchElements: QueryList<ElementRef>;
	@ViewChild(SearchResultsComponent)
	searchResults: SearchResultsComponent;
	@ViewChild(SearchBoxComponent)
	searchBox: SearchBoxComponent;

	@ViewChild(MdSidenav)
	sidenav: MdSidenav;

	constructor(
		public deployment: Deployment,
		private documentService: DocumentService,
		private hostElement: ElementRef,
		private locationService: LocationService,
		private navigationService: NavigationService,
		private scrollService: ScrollService,
		private searchService: SearchService,
		private tocService: TocService
	) { }

	ngOnInit() {
		// Do not initialize the search on browsers that lack web worker support
		if ('Worker' in window) {
			// Delay initialization by up to 2 seconds
			this.searchService.initWorker('app/search/search-worker.js', 2000);
		}

		this.onResize(window.innerWidth);

		/* No need to unsubscribe because this root component never dies */

		this.documentService.currentDocument.subscribe(doc => {
			this.currentDocument = doc;
			this.setPageId(doc.id);
			this.setFolderId(doc.id);
			this.updateHostClasses();
		});

		this.locationService.currentPath.subscribe(path => {
			// Redirect to docs if we are in not in stable mode and are not hitting a docs page
			// (i.e. we have arrived at a marketing page)
			if (this.deployment.mode !== 'stable' && !/^(docs$|api|guide|tutorial)/.test(path)) {
				this.locationService.replace('docs');
			}
			if (path === this.currentPath) {
				// scroll only if on same page (most likely a change to the hash)
				this.autoScroll();
			} else {
				// don't scroll; leave that to `onDocRendered`
				this.currentPath = path;

				// Start progress bar if doc not rendered within brief time
				clearTimeout(this.isFetchingTimeout);
				this.isFetchingTimeout = setTimeout(() => this.isFetching = true, 200);
			}
		});

		this.navigationService.currentNodes.subscribe(currentNodes => {
			this.currentNodes = currentNodes;

			// Preserve current sidenav open state by default
			let openSideNav = this.sidenav.opened;
			const isSideNavDoc = !!currentNodes[sideNavView];

			if (this.isSideNavDoc !== isSideNavDoc) {
				// View type changed. Is it now a sidenav view (e.g, guide or tutorial)?
				// Open if changed to a sidenav doc; close if changed to a marketing doc.
				openSideNav = this.isSideNavDoc = isSideNavDoc;
			}
			// May be open or closed when wide; always closed when narrow
			this.sideNavToggle(this.isSideBySide ? openSideNav : false);
		});

		// Compute the version picker list from the current version and the versions in the navigation map
		combineLatest(
			this.navigationService.versionInfo,
			this.navigationService.navigationViews.map(views => views['docVersions']))
			.subscribe(([versionInfo, versions]) => {
				// TODO(pbd): consider whether we can lookup the stable and next versions from the internet
				const computedVersions = [
					{ title: 'next', url: 'https://next.angular.io' },
					{ title: 'stable', url: 'https://angular.io' },
				];
				if (this.deployment.mode === 'archive') {
					computedVersions.push({ title: `v${versionInfo.major}`, url: null });
				}
				this.docVersions = [...computedVersions, ...versions];

				// Find the current version - eithers title matches the current deployment mode
				// or its title matches the major version of the current version info
				this.currentDocVersion = this.docVersions.find(version =>
					version.title === this.deployment.mode || version.title === `v${versionInfo.major}`);
				this.currentDocVersion.title += ` (v${versionInfo.raw})`;
			});

		this.navigationService.navigationViews.subscribe(views => {
			this.footerNodes = views['Footer'] || [];
			this.sideNavNodes = views['SideNav'] || [];
			this.topMenuNodes = views['TopBar'] || [];
			this.topMenuNarrowNodes = views['TopBarNarrow'] || this.topMenuNodes;
		});

		this.navigationService.versionInfo.subscribe(vi => this.versionInfo = vi);

		const hasNonEmptyToc = this.tocService.tocList.map(tocList => tocList.length > 0);
		combineLatest(hasNonEmptyToc, this.showFloatingToc)
			.subscribe(([hasToc, showFloatingToc]) => this.hasFloatingToc = hasToc && showFloatingToc);
	}

	// Scroll to the anchor in the hash fragment or top of doc.
	autoScroll() {
		this.scrollService.scroll();
	}

	onDocRendered() {
		// Stop fetching timeout (which, when render is fast, means progress bar never shown)
		clearTimeout(this.isFetchingTimeout);

		// Put page in a clean visual state
		this.scrollService.scrollToTop();

		// Scroll 500ms after the doc-viewer has finished rendering the new doc
		// The delay is to allow time for async layout to complete
		setTimeout(() => {
			this.autoScroll();
			this.isStarting = false;
			this.isFetching = false;
		}, 500);
	}

	onDocVersionChange(versionIndex: number) {
		const version = this.docVersions[versionIndex];
		if (version.url) {
			this.locationService.go(version.url);
		}
	}

	@HostListener('window:resize', ['$event.target.innerWidth'])
	onResize(width) {
		this.isSideBySide = width > this.sideBySideWidth;
		this.showFloatingToc.next(width > this.showFloatingTocWidth);
	}

	@HostListener('click', ['$event.target', '$event.button', '$event.ctrlKey', '$event.metaKey', '$event.altKey'])
	onClick(eventTarget: HTMLElement, button: number, ctrlKey: boolean, metaKey: boolean, altKey: boolean): boolean {

		// Hide the search results if we clicked outside both the "search box" and the "search results"
		if (!this.searchElements.some(element => element.nativeElement.contains(eventTarget))) {
			this.hideSearchResults();
		}

		// Show developer source view if the footer is clicked while holding the meta and alt keys
		if (eventTarget.tagName === 'FOOTER' && metaKey && altKey) {
			this.dtOn = !this.dtOn;
			return false;
		}

		// Deal with anchor clicks; climb DOM tree until anchor found (or null)
		let target = eventTarget;
		while (target && !(target instanceof HTMLAnchorElement)) {
			target = target.parentElement;
		}
		if (target instanceof HTMLAnchorElement) {
			return this.locationService.handleAnchorClick(target, button, ctrlKey, metaKey);
		}

		// Allow the click to pass through
		return true;
	}

	sideNavToggle(value?: boolean) {
		this.sidenav.toggle(value);
	}

	setPageId(id: string) {
		// Special case the home page
		this.pageId = (id === 'index') ? 'home' : id.replace('/', '-');
	}

	setFolderId(id: string) {
		// Special case the home page
		this.folderId = (id === 'index') ? 'home' : id.split('/', 1)[0];
	}

	updateHostClasses() {
		const mode = `mode-${this.deployment.mode}`;
		const sideNavOpen = `sidenav-${this.sidenav.opened ? 'open' : 'closed'}`;
		const pageClass = `page-${this.pageId}`;
		const folderClass = `folder-${this.folderId}`;
		const viewClasses = Object.keys(this.currentNodes || {}).map(view => `view-${view}`).join(' ');

		this.hostClasses = `${mode} ${sideNavOpen} ${pageClass} ${folderClass} ${viewClasses}`;
	}

	// Dynamically change height of table of contents container
	@HostListener('window:scroll')
	onScroll() {
		if (!this.tocMaxHeightOffset) {
			// Must wait until now for md-toolbar to be measurable.
			const el = this.hostElement.nativeElement as Element;
			this.tocMaxHeightOffset =
				el.querySelector('footer').clientHeight +
				el.querySelector('md-toolbar.app-toolbar').clientHeight +
				24; //  fudge margin
		}

		this.tocMaxHeight = (document.body.scrollHeight - window.pageYOffset - this.tocMaxHeightOffset).toFixed(2);
	}

	// Restrain scrolling inside an element, when the cursor is over it
	restrainScrolling(evt: WheelEvent) {
		const elem = evt.currentTarget as Element;
		const scrollTop = elem.scrollTop;

		if (evt.deltaY < 0) {
			// Trying to scroll up: Prevent scrolling if already at the top.
			if (scrollTop < 1) {
				evt.preventDefault();
			}
		} else {
			// Trying to scroll down: Prevent scrolling if already at the bottom.
			const maxScrollTop = elem.scrollHeight - elem.clientHeight;
			if (maxScrollTop - scrollTop < 1) {
				evt.preventDefault();
			}
		}
	}


	// Search related methods and handlers

	hideSearchResults() {
		this.showSearchResults = false;
	}

	focusSearchBox() {
		if (this.searchBox) {
			this.searchBox.focus();
		}
	}

	doSearch(query) {
		this.searchService.search(query);
		this.showSearchResults = !!query;
	}

	@HostListener('document:keyup', ['$event.key', '$event.which'])
	onKeyUp(key: string, keyCode: number) {
		// forward slash "/"
		if (key === '/' || keyCode === 191) {
			this.focusSearchBox();
		}
		if (key === 'Escape' || keyCode === 27) {
			// escape key
			if (this.showSearchResults) {
				this.hideSearchResults();
				this.focusSearchBox();
			}
		}
	}
}