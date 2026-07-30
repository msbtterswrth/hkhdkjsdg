<?php

/**
 * Load services definition file.
 */
$settings['container_yamls'][] = __DIR__ . '/services.yml';

/**
 * Include the Pantheon-specific settings file.
 *
 * n.b. The settings.pantheon.php file makes some changes
 *      that affect all environments that this site
 *      exists in.  Always include this file, even in
 *      a local development environment, to ensure that
 *      the site settings remain consistent.
 */
include __DIR__ . "/settings.pantheon.php";

/**
 * Skipping permissions hardening will make scaffolding
 * work better, but will also raise a warning when you
 * install Drupal.
 *
 * https://www.drupal.org/project/drupal/issues/3091285
 */
// $settings['skip_permissions_hardening'] = TRUE;

/**
 * If there is a local settings file, then include it
 */
$local_settings = __DIR__ . "/settings.local.php";
if (file_exists($local_settings)) {
  include $local_settings;
}

/**
 * Salt for one-time login links, cancel links, form tokens, etc.
 *
 * This variable will be set to a random value by the installer. All one-time
 * login links will be invalidated if the value is changed. Note that if your
 * site is deployed on a cluster of web servers, you must ensure that this
 * variable has the same value on each server.
 *
 * For enhanced security, you may set this variable to the contents of a file
 * outside your document root, and vary the value across environments (like
 * production and development); you should also ensure that this file is not
 * stored with backups of your database.
 *
 * Example:
 * @code
 *   $settings['hash_salt'] = file_get_contents('/home/example/salt.txt');
 * @endcode
 */
// $settings['hash_salt'] = '';

/**
 * The default list of directories that will be ignored by Drupal's file API.
 *
 * By default ignore node_modules and bower_components folders to avoid issues
 * with common frontend tools and recursive scanning of directories looking for
 * extensions.
 *
 * @see \Drupal\Core\File\FileSystemInterface::scanDirectory()
 * @see \Drupal\Core\Extension\ExtensionDiscovery::scanDirectory()
 */
$settings['file_scan_ignore_directories'] = [
  'node_modules',
  'bower_components',
];

/**
 * The default number of entities to update in a batch process.
 *
 * This is used by update and post-update functions that need to go through and
 * change all the entities on a site, so it is useful to increase this number
 * if your hosting configuration (i.e. RAM allocation, CPU speed) allows for a
 * larger number of entities to be processed in a single batch run.
 */
$settings['entity_update_batch_size'] = 50;

/**
 * Entity update backup.
 *
 * This is used to inform the entity storage handler that the backup tables as
 * well as the original entity type and field storage definitions should be
 * retained after a successful entity update process.
 */
$settings['entity_update_backup'] = TRUE;

/**
 * Node migration type.
 *
 * This is used to force the migration system to use the classic node migrations
 * instead of the default complete node migrations. The migration system will
 * use the classic node migration only if there are existing migrate_map tables
 * for the classic node migrations and they contain data. These tables may not
 * exist if you are developing custom migrations and do not want to use the
 * complete node migrations. Set this to TRUE to force the use of the classic
 * node migrations.
 */
$settings['migrate_node_migrate_type_classic'] = FALSE;

$settings['config_sync_directory'] = '../config/sync';

// Include settings required for Redis cache on Pantheon.
if (defined(
 'PANTHEON_ENVIRONMENT'
) && !\Drupal\Core\Installer\InstallerKernel::installationAttempted(
) && extension_loaded('redis')) {
 // Set Redis as the default backend for any cache bin not otherwise specified.
 $settings['cache']['default'] = 'cache.backend.redis';

 //phpredis is built into the Pantheon application container.
 $settings['redis.connection']['interface'] = 'PhpRedis';

 // These are dynamic variables handled by Pantheon.
 $settings['redis.connection']['host'] = $_ENV['CACHE_HOST'];
 $settings['redis.connection']['port'] = $_ENV['CACHE_PORT'];
 $settings['redis.connection']['password'] = $_ENV['CACHE_PASSWORD'];

 $settings['redis_compress_length'] = 100;
 $settings['redis_compress_level'] = 1;

 $settings['cache_prefix']['default'] = 'pantheon-redis';

 $settings['cache']['bins']['form'] = 'cache.backend.database'; // Use the database for forms

 // Apply changes to the container configuration to make better use of Redis.
 // This includes using Redis for the lock and flood control systems, as well
 // as the cache tag checksum. Alternatively, copy the contents of that file
 // to your project-specific services.yml file, modify as appropriate, and
 // remove this line.
 $settings['container_yamls'][] = 'modules/contrib/redis/example.services.yml';

 // Allow the services to work before the Redis module itself is enabled.
 $settings['container_yamls'][] = 'modules/contrib/redis/redis.services.yml';

 // Manually add the classloader path, this is required for the container
 // cache bin definition below.
 $class_loader->addPsr4('Drupal\\redis\\', 'modules/contrib/redis/src');

 /**
 * Default TTL for Redis is 1 year.
 *
 * Change cache expiration (TTL) for data,default bin - 12 hours.
 * Change cache expiration (TTL) for entity bin - 48 hours.
 *
 * @see \Drupal\redis\Cache\CacheBase::LIFETIME_PERM_DEFAULT
 */

 $settings['redis.settings']['perm_ttl'] = 2630000; // 30 days
 $settings['redis.settings']['perm_ttl_config'] = 43200;
 $settings['redis.settings']['perm_ttl_data'] = 43200;
 $settings['redis.settings']['perm_ttl_default'] = 43200;
 $settings['redis.settings']['perm_ttl_entity'] = 172800;

 // Use redis for container cache.
 // The container cache is used to load the container definition itself, and
 // thus any configuration stored in the container itself is not available
 // yet. These lines force the container cache to use Redis rather than the
 // default SQL cache.
 $settings['bootstrap_container_definition'] = [
   'parameters' => [],
   'services' => [
     'redis.factory' => [
       'class' => 'Drupal\redis\ClientFactory',
     ],
     'cache.backend.redis' => [
       'class' => 'Drupal\redis\Cache\CacheBackendFactory',
       'arguments' => [
         '@redis.factory',
         '@cache_tags_provider.container',
         '@serialization.phpserialize',
       ],
     ],
     'cache.container' => [
       'class' => '\Drupal\redis\Cache\PhpRedis',
       'factory' => ['@cache.backend.redis', 'get'],
       'arguments' => ['container'],
     ],
     'cache_tags_provider.container' => [
       'class' => 'Drupal\redis\Cache\RedisCacheTagsChecksum',
       'arguments' => ['@redis.factory'],
     ],
     'serialization.phpserialize' => [
       'class' => 'Drupal\Component\Serialization\PhpSerialize',
     ],
   ],
 ];
}

// Automatically generated include for settings managed by ddev.
$ddev_settings = __DIR__ . '/settings.ddev.php';
if (getenv('IS_DDEV_PROJECT') == 'true' && is_readable($ddev_settings)) {
  require $ddev_settings;
}

// Include settings required for Redis cache.
if (getenv('IS_DDEV_PROJECT') == 'true' && file_exists(__DIR__ . '/settings.ddev.redis.php')) {
  include __DIR__ . '/settings.ddev.redis.php';
}
