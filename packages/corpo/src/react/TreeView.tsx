import type { CSSProperties, HTMLAttributes } from 'react';

export interface TreeItem {
  id: string;
  label: string;
  children?: TreeItem[];
}

export interface TreeViewProps extends Omit<HTMLAttributes<HTMLUListElement>, 'onSelect'> {
  items: TreeItem[];
  expandedIds: string[];
  onExpandedChange?: (ids: string[]) => void;
  selectedId?: string;
  onSelect?: (id: string, item: TreeItem) => void;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

function depthStyle(depth: number): CSSProperties {
  // SAFETY: custom CSS properties are valid style keys at runtime; React's
  // CSSProperties type simply has no entry for them.
  return { '--cp-tree-depth': depth } as CSSProperties;
}

interface TreeNodeProps {
  item: TreeItem;
  depth: number;
  expandedIds: string[];
  selectedId?: string;
  onToggle: (id: string) => void;
  onSelect?: (id: string, item: TreeItem) => void;
}

function TreeNode({ item, depth, expandedIds, selectedId, onToggle, onSelect }: TreeNodeProps) {
  const hasChildren = Boolean(item.children && item.children.length > 0);
  const expanded = hasChildren && expandedIds.includes(item.id);
  const selected = selectedId === item.id;

  return (
    <li className="cp-tree__node" role="none">
      <div className={cx('cp-tree__row', selected && 'is-selected')} style={depthStyle(depth)} data-depth={depth}>
        {hasChildren ? (
          <button
            type="button"
            className="cp-tree__toggle"
            aria-label={expanded ? `Collapse ${item.label}` : `Expand ${item.label}`}
            onClick={() => onToggle(item.id)}
          >
            <span className={cx('cp-tree__chevron', expanded && 'is-open')} aria-hidden="true" />
          </button>
        ) : (
          <span className="cp-tree__spacer" aria-hidden="true" />
        )}
        <button
          type="button"
          className="cp-tree__item"
          role="treeitem"
          aria-expanded={hasChildren ? expanded : undefined}
          aria-selected={selected}
          onClick={() => onSelect?.(item.id, item)}
        >
          <span className="cp-tree__label">{item.label}</span>
        </button>
      </div>
      {hasChildren && expanded && (
        <ul className="cp-tree__group" role="group">
          {item.children!.map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              selectedId={selectedId}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function TreeView({
  items,
  expandedIds,
  onExpandedChange,
  selectedId,
  onSelect,
  className = '',
  ...rest
}: TreeViewProps) {
  const onToggle = (id: string) => {
    const next = expandedIds.includes(id) ? expandedIds.filter((x) => x !== id) : [...expandedIds, id];
    onExpandedChange?.(next);
  };

  return (
    <ul className={cx('cp-tree', className)} role="tree" {...rest}>
      {items.map((item) => (
        <TreeNode
          key={item.id}
          item={item}
          depth={0}
          expandedIds={expandedIds}
          selectedId={selectedId}
          onToggle={onToggle}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}
