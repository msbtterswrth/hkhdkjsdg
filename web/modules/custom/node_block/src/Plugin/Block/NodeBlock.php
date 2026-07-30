<?php

namespace Drupal\node_block\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Cache\Cache;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityViewBuilderInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\node\NodeInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Provides a block for nodes.
 *
 * @Block(
 *   id = "node_block",
 *   admin_label = @Translation("Node Block")
 * )
 */
class NodeBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * The entity field manager.
   *
   * @var \Drupal\Core\Entity\EntityFieldManagerInterface
   */
  protected $entityFieldManager;

  /**
   * The node view builder.
   *
   * @var \Drupal\Core\Entity\EntityViewBuilderInterface
   */
  protected $viewBuilder;

  /**
   * The node storage.
   *
   * @var \Drupal\Core\Entity\EntityStorageInterface
   */
  protected $nodeStorage;

  /**
   * The request stack.
   *
   * @var \Symfony\Component\HttpFoundation\RequestStack
   */
  protected $requestStack;

  /**
   * The view mode.
   *
   * @var string
   */
  protected $viewMode = 'block';

  /**
   * The current node.
   *
   * @var \Drupal\node\NodeInterface|null
   */
  protected $node;

  /**
   * Constructs a NodeBlock instance.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Entity\EntityFieldManagerInterface $entity_field_manager
   *   The entity field manager.
   * @param \Drupal\Core\Entity\EntityViewBuilderInterface $view_builder
   *   The node view builder.
   * @param \Drupal\Core\Entity\EntityStorageInterface $node_storage
   *   The node storage.
   * @param \Symfony\Component\HttpFoundation\RequestStack $request_stack
   *   The request stack.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    EntityFieldManagerInterface $entity_field_manager,
    EntityViewBuilderInterface $view_builder,
    EntityStorageInterface $node_storage,
    RequestStack $request_stack,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->entityFieldManager = $entity_field_manager;
    $this->viewBuilder = $view_builder;
    $this->nodeStorage = $node_storage;
    $this->requestStack = $request_stack;
    $this->node = NULL;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): self {
    $entity_type_manager = $container->get('entity_type.manager');

    return new self(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('entity_field.manager'),
      $entity_type_manager->getViewBuilder('node'),
      $entity_type_manager->getStorage('node'),
      $container->get('request_stack'),
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build(): array {
    $request = $this->requestStack->getCurrentRequest();
    $node = $request ? $request->attributes->get('node') : NULL;

    if (is_numeric($node)) {
      $node = $this->nodeStorage->load($node);
    }

    $this->node = $node instanceof NodeInterface ? $node : NULL;

    $build = [];
    if ($this->node instanceof NodeInterface) {
      $fields = $this->entityFieldManager->getFieldDefinitions('node', $this->node->bundle());

      foreach ($fields as $name => $definition) {
        if (!$this->node->get($name)->isEmpty()) {
          $build[$name] = $this->viewBuilder->viewField($this->node->get($name), $this->viewMode);
        }
      }
    }

    return $build;
  }

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration(): array {
    return [
      'theme_suggestion' => '',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state): array {
    return [
      'theme_suggestion' => [
        '#type' => 'textfield',
        '#title' => $this->t('Theme Suggestion'),
        '#default_value' => $this->configuration['theme_suggestion'],
        '#description' => $this->t('Creates a theme suggestion for block--node-block--&lt;theme suggestion&gt;.html.twig.'),
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state): void {
    $this->configuration['theme_suggestion'] = $form_state->getValue('theme_suggestion');
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheContexts(): array {
    return Cache::mergeContexts([
      'url.path',
    ], parent::getCacheContexts());
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheTags(): array {
    if (!$this->node instanceof NodeInterface) {
      return parent::getCacheTags();
    }

    return Cache::mergeTags([
      'node:' . $this->node->id(),
    ], parent::getCacheTags());
  }

}