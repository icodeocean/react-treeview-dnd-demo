import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { TreeView, TreeViewDragClue, processTreeViewItems, moveTreeViewItem, TreeViewDragAnalyzer } from '@progress/kendo-react-treeview';
function getSiblings(itemIndex, data) {
  let result = data;
  const indices = itemIndex.split(SEPARATOR).map(index => Number(index));
  for (let i = 0; i < indices.length - 1; i++) {
    result = result[indices[i]].items || [];
  }
  return result;
}
const SEPARATOR = '_';
const treeData = [{
  text: 'Furniture',
  expanded: true,
  items: [{
    text: 'Tables & Chairs'
  }, {
    text: 'Sofas'
  }, {
    text: 'Occasional Furniture'
  }]
}, {
  text: 'Decor',
  expanded: true,
  items: [{
    text: 'Bed Linen'
  }, {
    text: 'Curtains & Blinds'
  }, {
    text: 'Carpets'
  }]
}];
const App = () => {
  const dragClue = React.useRef();
  const dragOverCnt = React.useRef(0);
  const isDragDrop = React.useRef(false);
  const [tree, setTree] = React.useState(treeData);
  const [expand, setExpand] = React.useState({
    ids: [],
    idField: 'text'
  });
  const [selected, setSelected] = React.useState({
    ids: [],
    idField: 'text'
  });
  const getClueClassName = event => {
    const eventAnalyzer = new TreeViewDragAnalyzer(event).init();
    const {
      itemHierarchicalIndex: itemIndex
    } = eventAnalyzer.destinationMeta;
    if (eventAnalyzer.isDropAllowed) {
      switch (eventAnalyzer.getDropOperation()) {
        case 'child':
          return 'k-i-plus';
        case 'before':
          return itemIndex === '0' || itemIndex.endsWith(`${SEPARATOR}0`) ? 'k-i-insert-up' : 'k-i-insert-middle';
        case 'after':
          const siblings = getSiblings(itemIndex, tree);
          const lastIndex = Number(itemIndex.split(SEPARATOR).pop());
          return lastIndex < siblings.length - 1 ? 'k-i-insert-middle' : 'k-i-insert-down';
        default:
          break;
      }
    }
    return 'k-i-cancel';
  };
  const onItemDragOver = event => {
    dragOverCnt.current++;
    dragClue.current.show(event.pageY + 10, event.pageX, event.item.text, getClueClassName(event));
  };
  const onItemDragEnd = event => {
    isDragDrop.current = dragOverCnt.current > 0;
    dragOverCnt.current = 0;
    dragClue.current.hide();
    const eventAnalyzer = new TreeViewDragAnalyzer(event).init();
    if (eventAnalyzer.isDropAllowed) {
      const updatedTree = moveTreeViewItem(event.itemHierarchicalIndex, tree, eventAnalyzer.getDropOperation() || 'child', eventAnalyzer.destinationMeta.itemHierarchicalIndex);
      setTree(updatedTree);
    }
  };
  const onItemClick = event => {
    if (!isDragDrop.current) {
      let ids = selected.ids.slice();
      const index = ids.indexOf(event.item.text);
      index === -1 ? ids.push(event.item.text) : ids.splice(index, 1);
      setSelected({
        ids,
        idField: 'text'
      });
    }
  };
  const onExpandChange = event => {
    let ids = expand.ids.slice();
    const index = ids.indexOf(event.item.text);
    index === -1 ? ids.push(event.item.text) : ids.splice(index, 1);
    setExpand({
      ids,
      idField: 'text'
    });
  };
  return <div>
        <TreeView draggable={true} onItemDragOver={onItemDragOver} onItemDragEnd={onItemDragEnd} data={processTreeViewItems(tree, {
      expand: expand,
      select: selected
    })} expandIcons={true} onExpandChange={onExpandChange} onItemClick={onItemClick} />
        <TreeViewDragClue ref={dragClue} />
      </div>;
};
ReactDOM.render(<App />, document.querySelector('my-app'));