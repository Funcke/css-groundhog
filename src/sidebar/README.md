---
layout: components_icons.hbs
meta:
  title: "Sidebar"
  description: "A sidebar component for Dynatrace styled web entities with css and markup examples."
  keywords: "sidebar, navigation, Dynatrace, groundhog, css component"
---


## Introduction
The Groundhog **sidebar** component component introduces a possibility of creating an additional navigation. A sidebar is typically used to link navigational elements on the same level as the current page.


## Including the sidebar component
1. To create a Groundhog **sidebar**, first create the `<div>`, `<a>` (anchor) and `<span>` elements in the following structure:
```html
<div>
  <a href="#">
    <span></span>
  </a>
  <a href="#">
    <span></span>
  </a>
</div>
```
2. To apply the visual styles of Groundhog, add the necessary classes to the `class` attribute of the elements.
```html
<div class="sidebar">
  <a class="sidebar__item" href="#">
    <span class="sidebar__headline"></span>
  </a>
  <a class="sidebar__item" href="#">
    <span class="sidebar__headline"></span>
  </a>
</div>
```
3. Each sidebar item can hold a headline and an optional info text:
```html
<div class="sidebar">
  <a class="sidebar__item" href="#">
    <span class="sidebar__headline"></span>
    <span class="sidebar__info"></span>
  </a>
  <a class="sidebar__item" href="#">
    <span class="sidebar__headline"></span>
  </a>
</div>
```


## Create an expandable sidebar

## A note to expandable sidebars

The `expandable` sidebars need the [expandable module][expandable] to be included. To make sure the cascade doesn't overwrite properties, the `expandable` module has to be first.

You don't have to care about that if you use the complete framework.



[expandable]: /docs/components/expandable/
