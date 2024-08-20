/** @format */

import { ChangeDetectionStrategy, Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthenticatedComponent } from '../../authenticated/authenticated.component';
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';
import { CurrentUserMixin } from '../../../../core/mixins/current-user.mixin';
import { HelperService } from '../../../../core/services/helper.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';

@Component({
	standalone: true,
	selector: 'app-list-mock, [appListMock]',
	imports: [RouterModule, SvgIconComponent, AuthenticatedComponent, SkeletonDirective],
	templateUrl: './mock.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListMockComponent extends CurrentUserMixin(class {}) implements OnInit, OnDestroy {
	public readonly helperService: HelperService = inject(HelperService);
	public readonly snackbarService: SnackbarService = inject(SnackbarService);
	public readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);

	@Input({ required: true })
	set appListMockTemplate(template: string) {
		this.template = template;
	}

	template: string | undefined;

	username: string | undefined;
	categoryId: number | undefined;
	postId: number | undefined;
	query: string | undefined;

	ngOnInit(): void {
		super.ngOnInit();

		// ngOnInit

		this.username = String(this.activatedRoute.snapshot.paramMap.get('username') || '');
		this.categoryId = Number(this.activatedRoute.snapshot.paramMap.get('categoryId'));
		this.postId = Number(this.activatedRoute.snapshot.paramMap.get('postId'));
		this.query = String(this.activatedRoute.snapshot.queryParamMap.get('query') || '');
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	getInviteURL(): void {
		const url: URL = this.helperService.getURL();

		// Clear search params

		for (const key of url.searchParams.keys()) {
			url.searchParams.delete(key);
		}

		url.pathname = 'registration';
		url.searchParams.set('invited', String(this.currentUser.id));

		this.helperService.getNavigatorClipboard(url.toString()).subscribe({
			next: () => this.snackbarService.success('Easy', 'Invite link has been copied'),
			error: (error: any) => console.error(error)
		});
	}
}
