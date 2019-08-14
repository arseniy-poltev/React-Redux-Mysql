import React from 'react';
import config from '../config';

const Home = React.lazy(() => import('../pages/BasicPage/Home/index'));
const MyActivity = React.lazy(() => import('../pages/BasicPage/MyActivity/index'));
const ProfessionalService = React.lazy(() => import('../pages/BasicPage/ProfessionalService/index'));
const Group = React.lazy(() => import('../pages/BasicPage/Group/index'));
const Contact = React.lazy(() => import('../pages/BasicPage/Contact/index'));
const CommunityAdmin = React.lazy(() => import('../pages/BasicPage/CommunityAdmin/index'));
const SuperAdmin = React.lazy(() => import('../pages/BasicPage/SuperAdmin/index'));
const Calendar = React.lazy(() => import('../pages/BasicPage/Calendar/index'));
const Emergency = React.lazy(() => import('../pages/BasicPage/Emergency/index'));
const Setting = React.lazy(() => import('../pages/BasicPage/Setting/index'));
const ViewActivityDetail = React.lazy(() => import('../pages/BasicPage/MyActivity/ViewActivityDetail/index'));

const getRoutes = (userInfo) => (userInfo && userInfo.communities.find(
    community => community.role === config.userType.SUPER_ADMIN)
    ? [
        {path: '/dashboard/:communityId', name: 'Home', component: Home},
        {path: '/my-activity/:communityId', name: 'MyActivity', component: MyActivity},
        {path: '/services', name: 'ProfessionalService', component: ProfessionalService},
        {path: '/groups', name: 'Group', component: Group},
        {path: '/contacts', name: 'Contact', component: Contact},
        {path: '/super', name: 'SuperAdmin', component: SuperAdmin},
        {path: '/calendar', name: 'Calendar', component: Calendar},
        {path: '/emergency', name: 'Emergency', component: Emergency},
        {path: '/settings', name: 'Setting', component: Setting},
        {path: '/detail', name: 'ViewActivityDetail', component: ViewActivityDetail},
    ] : userInfo && userInfo.communities.find(
        community => community.role === config.userType.ADMIN)
        ? [
            {path: '/dashboard/:communityId', name: 'Home', component: Home},
            {path: '/my-activity/:communityId', name: 'MyActivity', component: MyActivity},
            {path: '/services', name: 'ProfessionalService', component: ProfessionalService},
            {path: '/groups', name: 'Group', component: Group},
            {path: '/contacts', name: 'Contact', component: Contact},
            {path: '/admin/users/:usersType/:communityId', name: 'CommunityAdmin', component: CommunityAdmin},
            {path: '/admin/cards/:communityId', name: 'CommunityAdmin', component: CommunityAdmin},
            {path: '/calendar', name: 'Calendar', component: Calendar},
            {path: '/emergency', name: 'Emergency', component: Emergency},
            {path: '/settings', name: 'Setting', component: Setting},
            {path: '/detail', name: 'ViewActivityDetail', component: ViewActivityDetail},
        ] : [
            {path: '/dashboard/:communityId', name: 'Home', component: Home},
            {path: '/my-activity/:communityId', name: 'MyActivity', component: MyActivity},
            {path: '/services', name: 'ProfessionalService', component: ProfessionalService},
            {path: '/groups', name: 'Group', component: Group},
            {path: '/contacts', name: 'Contact', component: Contact},
            {path: '/calendar', name: 'Calendar', component: Calendar},
            {path: '/emergency', name: 'Emergency', component: Emergency},
            {path: '/settings', name: 'Setting', component: Setting},
            {path: '/detail', name: 'ViewActivityDetail', component: ViewActivityDetail},
        ]);

export default getRoutes;
