import config from '../config';

export const getNav = (userInfo) => ({
        items: userInfo && userInfo.communities.find(community => community.role === config.userType.SUPER_ADMIN)
            ? [
                {
                    name: 'Community Activity',
                    url: '/dashboard',
                    icon: 'fa fa-home',
                    children: userInfo && userInfo.communities.map(community => ({
                        name: community.name,
                        url: '/dashboard/' + community.id,
                    }))
                },
                {
                    name: 'My Activity',
                    url: '/my-activity',
                    icon: 'fa fa-envelope',
                    children: userInfo && userInfo.communities.map(community => ({
                        name: community.name,
                        url: '/my-activity/' + community.id,
                    }))
                },
                {
                    name: 'Professional Services',
                    url: '/services',
                    icon: 'fa fa-envelope',
                },
                {
                    name: 'Group',
                    url: '/groups',
                    icon: 'fa fa-envelope',
                },
                {
                    name: 'Contacts',
                    url: '/contacts',
                    icon: 'fa fa-user',
                },
                {
                    name: 'Super Admin',
                    url: '/super',
                    icon: 'fa fa-comment',
                },
                {
                    name: 'Calendar',
                    url: '/calendar',
                    icon: 'fa fa-calendar',
                },
                {
                    name: 'Emergency/Help Services',
                    url: '/emergency',
                    icon: 'fa fa-life-ring',
                },
                {
                    name: 'Settings',
                    url: '/settings',
                    icon: 'fa fa-cog'
                },
            ] : userInfo && userInfo.communities.find(community => community.role === config.userType.ADMIN)
                ? [
                    {
                        name: 'Community Activity',
                        url: '/dashboard',
                        icon: 'fa fa-home',
                        children: userInfo && userInfo.communities.map(community => ({
                            name: community.name,
                            url: '/dashboard/' + community.id,
                        }))
                    },
                    {
                        name: 'My Activity',
                        url: '/my-activity',
                        icon: 'fa fa-envelope',
                        children: userInfo && userInfo.communities.map(community => ({
                            name: community.name,
                            url: '/my-activity/' + community.id,
                        }))
                    },
                    {
                        name: 'Professional Services',
                        url: '/services',
                        icon: 'fa fa-envelope',
                    },
                    {
                        name: 'Group',
                        url: '/groups',
                        icon: 'fa fa-envelope',
                    },
                    {
                        name: 'Contacts',
                        url: '/contacts',
                        icon: 'fa fa-user',
                    },
                    {
                        name: 'Community Admin',
                        url: '/admin/cards/',
                        icon: 'fa fa-comment',
                        children: userInfo && userInfo.communities.filter(
                            community => community.role === config.userType.ADMIN
                        ).map(community => ({
                            name: community.name,
                            url: '/admin/cards/' + community.id,
                        }))
                    },
                    {
                        name: 'Calendar',
                        url: '/calendar',
                        icon: 'fa fa-calendar',
                    },
                    {
                        name: 'Emergency/Help Services',
                        url: '/emergency',
                        icon: 'fa fa-life-ring',
                    },
                    {
                        name: 'Settings',
                        url: '/settings',
                        icon: 'fa fa-cog'
                    },
                ] : [
                    {
                        name: 'Community Activity',
                        url: '/dashboard',
                        icon: 'fa fa-home',
                        children: userInfo && userInfo.communities.map(community => ({
                            name: community.name,
                            url: '/dashboard/' + community.id,
                        }))
                    },
                    {
                        name: 'My Activity',
                        url: '/my-activity',
                        icon: 'fa fa-envelope',
                        children: userInfo && userInfo.communities.map(community => ({
                            name: community.name,
                            url: '/my-activity/' + community.id,
                        }))
                    },
                    {
                        name: 'Professional Services',
                        url: '/services',
                        icon: 'fa fa-envelope',
                    },
                    {
                        name: 'Group',
                        url: '/groups',
                        icon: 'fa fa-envelope',
                    },
                    {
                        name: 'Contacts',
                        url: '/contacts',
                        icon: 'fa fa-user',
                    },
                    {
                        name: 'Calendar',
                        url: '/calendar',
                        icon: 'fa fa-calendar',
                    },
                    {
                        name: 'Emergency/Help Services',
                        url: '/emergency',
                        icon: 'fa fa-life-ring',
                    },
                    {
                        name: 'Settings',
                        url: '/settings',
                        icon: 'fa fa-cog'
                    },
                ]
    })
;
