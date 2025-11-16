---
trigger: manual
---

Zone Wrappers
AngularFire wraps the framework agnostic Firebase JS SDK and RxFire to ensure proper functionality in Zone and Zoneless applications alike.

These wrappers ensure Firebase APIs are called outside of the Angular zone. This isolates side-effects such as timers so that they do not destabilize your application.

Observables, Promise-based APIs, and those with callbacks will purposely destabilize your application until a initial value is returned, this ensures that server-side rendering (SSR) and static site generation (SSG/pre-rendering) wait for data before rendering the page's HTML.

Consequences of not Zone wrapping
When using a Firebase or RxFire API without importing from AngularFire or if AngularFire APIs are used outside of an injection context you may experience instability.

When an application is unstable change-detection, two-way binding, and rehydration may not work as expected—leading to both subtle and non-subtle bugs in your application. Further, server-side rendering (SSR) and static site generation (SSG/pre-rendering) may timeout or render a blank page.

There are a number of situations where AngularFire's Zone wrapping is inconsequential such adding/deleting/updating a document in response to user-input, signing a user in, calling a Cloud Function, etc. So long as no long-lived side-effects are kicked off, your application should be ok. Most Promise based APIs are fairly safe without zone wrapping.
