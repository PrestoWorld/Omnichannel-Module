<?php

declare(strict_types=1);

namespace PrestoWorld\Modules\Omnichannel;

use Witals\Framework\Application;
use Witals\Framework\Module\Module as WitalsModule;

class Module extends WitalsModule
{
    public function __construct(
        protected Application $app,
        protected string $path = '',
        protected array $metadata = [],
    ) {
        if ($path === '') {
            $path = __DIR__;
        }
        if ($metadata === []) {
            $metadata = ['name' => 'omnichannel'];
        }

        parent::__construct($app, $path, $metadata);
    }

    public function register(): void
    {
        // Register service providers, bindings, etc.
    }

    public function boot(): void
    {
        // Register dashboard screens
        $this->registerDashboardScreens();
    }

    protected function registerDashboardScreens(): void
    {
        if (!$this->app->has(\PrestoWorld\Foundation\Admin\DashboardScreenRegistryInterface::class)) {
            return;
        }

        $registry = $this->app->make(\PrestoWorld\Foundation\Admin\DashboardScreenRegistryInterface::class);
        if (!$registry instanceof \PrestoWorld\Foundation\Admin\DashboardScreenRegistryInterface) {
            return;
        }

        // Register ChatOrderCenter screen (seller omnichannel center)
        $registry->registerScreen(new \PrestoWorld\Admin\Screen\Screen(
            id: 'chat-order-center',
            title: 'Chat Order Center',
            icon: 'MessageCircle',
            position: 10,
            component: 'ChatOrderCenter',
            source: 'module',
        ));

        // Register UserMessengerView screen (customer messenger)
        $registry->registerScreen(new \PrestoWorld\Admin\Screen\Screen(
            id: 'user-messenger',
            title: 'User Messenger',
            icon: 'MessageSquare',
            position: 20,
            component: 'UserMessengerView',
            source: 'module',
        ));
    }

    public function getName(): string
    {
        return 'Omnichannel';
    }
}