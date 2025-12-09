import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { animated, useSpring } from '@react-spring/web';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { useTreeItem } from '@mui/x-tree-view/useTreeItem';
import {
  TreeItemContent,
  TreeItemIconContainer,
  TreeItemLabel,
  TreeItemRoot,
} from '@mui/x-tree-view/TreeItem';
import { TreeItemIcon } from '@mui/x-tree-view/TreeItemIcon';
import { TreeItemProvider } from '@mui/x-tree-view/TreeItemProvider';

import { useTheme } from '@mui/material/styles';

const ITEMS = [
  {
    id: '0',
    label: 'All Items',
  },
  {
    id: '1',
    label: 'Menu',
    children: [
      { id: '1.2', label: 'Milk Tea', color: 'green' },
      { id: '1.3', label: 'Coffee', color: 'indigo' },
      { id: '1.4', label: 'Blended', color: 'purple' },
      { id: '1.5', label: 'Matcha', color: 'green' },
      { id: '1.6', label: 'Fruit', color: 'orange' },
      {
        id: '1.7',
        label: 'Toppings',
        children: [
          { id: '1.7.1', label: 'Boba', color: 'blue' },
          { id: '1.7.2', label: 'Jelly', color: 'blue' },
          { id: '1.7.3', label: 'Pudding', color: 'blue' },
        ],
      },
    ],
  },
  {
    id: '2',
    label: 'Inventory',
    children: [
      { id: '2.1', label: 'Tea Leaves', color: 'indigo' },
      { id: '2.2', label: 'Syrups', color: 'indigo' },
      { id: '2.3', label: 'Milk', color: 'indigo' },
      { id: '2.4', label: 'Cups & Lids', color: 'indigo' },
    ],
  },
];

function DotIcon({ color }) {
  return (
    <Box sx={{ marginRight: 1, display: 'flex', alignItems: 'center' }}>
      <svg width={6} height={6}>
        <circle cx={3} cy={3} r={3} fill={color} />
      </svg>
    </Box>
  );
}

DotIcon.propTypes = {
  color: PropTypes.string.isRequired,
};

const AnimatedCollapse = animated(Collapse);

function TransitionComponent(props) {
  const style = useSpring({
    to: {
      opacity: props.in ? 1 : 0,
      transform: `translate3d(0,${props.in ? 0 : 20}px,0)`,
    },
  });

  return <AnimatedCollapse style={style} {...props} />;
}

TransitionComponent.propTypes = {
  /**
   * Show the component; triggers the enter or exit states
   */
  in: PropTypes.bool,
};

function CustomLabel({ color, expandable, children, ...other }) {
  const theme = useTheme();
  const colors = {
    blue: (theme.vars || theme).palette.primary.main,
    green: (theme.vars || theme).palette.success.main,
    orange: (theme.vars || theme).palette.warning.main,
    purple: (theme.vars || theme).palette.secondary.main,
    indigo: (theme.vars || theme).palette.info.main,
  };

  const iconColor = color ? colors[color] : null;
  return (
    <TreeItemLabel {...other} sx={{ display: 'flex', alignItems: 'center' }}>
      {iconColor && <DotIcon color={iconColor} />}
      <Typography
        className="labelText"
        variant="body2"
        sx={{ color: 'text.primary' }}
      >
        {children}
      </Typography>
    </TreeItemLabel>
  );
}

CustomLabel.propTypes = {
  children: PropTypes.node,
  color: PropTypes.oneOf(['blue', 'green', 'orange', 'purple', 'indigo']),
  expandable: PropTypes.bool,
};

const CustomTreeItem = React.forwardRef(function CustomTreeItem(props, ref) {
  const { id, itemId, label, disabled, children, ...other } = props;

  const {
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getLabelProps,
    getGroupTransitionProps,
    status,
    publicAPI,
  } = useTreeItem({ id, itemId, children, label, disabled, rootRef: ref });

  const item = publicAPI.getItem(itemId);
  const color = item?.color;
  return (
    <TreeItemProvider id={id} itemId={itemId}>
      <TreeItemRoot {...getRootProps(other)}>
        <TreeItemContent
          {...getContentProps({
            className: clsx('content', {
              expanded: status.expanded,
              selected: status.selected,
              focused: status.focused,
              disabled: status.disabled,
            }),
          })}
        >
          {status.expandable && (
            <TreeItemIconContainer {...getIconContainerProps()}>
              <TreeItemIcon status={status} />
            </TreeItemIconContainer>
          )}

          <CustomLabel {...getLabelProps({ color })} />
        </TreeItemContent>
        {children && (
          <TransitionComponent
            {...getGroupTransitionProps({ className: 'groupTransition' })}
          />
        )}
      </TreeItemRoot>
    </TreeItemProvider>
  );
});

CustomTreeItem.propTypes = {
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  /**
   * If `true`, the item is disabled.
   * @default false
   */
  disabled: PropTypes.bool,
  /**
   * The id attribute of the item. If not provided, it will be generated.
   */
  id: PropTypes.string,
  /**
   * The id of the item.
   * Must be unique.
   */
  itemId: PropTypes.string.isRequired,
  /**
   * The label of the item.
   */
  label: PropTypes.node,
};

export default function CustomizedTreeView({ onSelectionChange }) {
  const handleSelectedItemsChange = (event, ids) => {
    if (onSelectionChange) {
      // If multiSelect is true, ids is an array. If false, it's a string | null.
      // The component below has multiSelect={true}, so we expect an array.
      // We'll just take the first selected item for filtering simplicity.
      const selectedId = Array.isArray(ids) ? ids[0] : ids;
      
      // Find the label for the selected ID to pass back
      const findItem = (items, targetId) => {
        for (const item of items) {
          if (item.id === targetId) return item;
          if (item.children) {
            const found = findItem(item.children, targetId);
            if (found) return found;
          }
        }
        return null;
      };
      
      const item = findItem(ITEMS, selectedId);
      onSelectionChange(item ? item.label : null);
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}
    >
      <CardContent>
        <Typography component="h2" variant="subtitle2">
          Product tree
        </Typography>
        <RichTreeView
          items={ITEMS}
          aria-label="pages"
          multiSelect
          defaultExpandedItems={['1', '1.1']}
          defaultSelectedItems={['1.1', '1.1.1']}
          onSelectedItemsChange={handleSelectedItemsChange}
          sx={{
            m: '0 -8px',
            pb: '8px',
            height: 'fit-content',
            flexGrow: 1,
            overflowY: 'auto',
          }}
          slots={{ item: CustomTreeItem }}
        />
      </CardContent>
    </Card>
  );
}
