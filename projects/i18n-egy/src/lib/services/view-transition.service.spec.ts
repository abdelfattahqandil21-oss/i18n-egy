import { TestBed } from '@angular/core/testing';
import { ViewTransitionService } from './view-transition.service';

describe('ViewTransitionService', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should run callback directly when view transitions are unsupported', () => {
    const original = (document as any).startViewTransition;
    (document as any).startViewTransition = undefined;

    TestBed.configureTestingModule({});
    const service = TestBed.inject(ViewTransitionService);

    const spy = jasmine.createSpy('callback');
    service.run(spy);
    expect(spy).toHaveBeenCalledTimes(1);

    (document as any).startViewTransition = original;
  });

  it('should call document.startViewTransition when supported', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(ViewTransitionService);
    const spy = spyOn(document as any, 'startViewTransition');

    const callback = () => {};
    service.run(callback);
    expect(spy).toHaveBeenCalledWith(callback);
  });
});
