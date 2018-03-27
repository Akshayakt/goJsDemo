/**
 * @file
 */

$(document).ready(function() {
  var $$ = go.GraphObject.make; // for conciseness in defining templates

  diagram = $$(go.Diagram, 'diagram-container', {
    initialContentAlignment: go.Spot.Center,
    contentAlignment: go.Spot.Center,
    allowMove: false,
    allowCopy: false,
    allowDelete: false,
    allowHorizontalScroll: false,
    'animationManager.isEnabled': false,
    layout: $$(go.TreeLayout, {
      alignment: go.TreeLayout.AlignmentStart,
      angle: 0,
      compaction: go.TreeLayout.CompactionNone,
      layerSpacing: 20,
      layerSpacingParentOverlap: 1,
      nodeIndent: 5,
      nodeIndentPastParent: 1,
      nodeSpacing: 2,
      setsPortSpot: false,
      setsChildPortSpot: false
    })
  });

  diagram.nodeTemplate = $$(
    go.Node,
    {
      // no Adornment: instead change panel background color by binding to Node.isSelected
      selectionAdorned: false,
      // calls custom function to display details about each node when clicked
      click: showDetails,
      // a custom function to allow expanding/collapsing on double-click
      // this uses similar logic to a TreeExpanderButton
      doubleClick: function(e, node) {
        var cmd = diagram.commandHandler;
        if (node.isTreeExpanded) {
          if (!cmd.canCollapseTree(node)) return;
        } else {
          if (!cmd.canExpandTree(node)) return;
        }
        e.handled = true;
        if (node.isTreeExpanded) {
          cmd.collapseTree(node);
        } else {
          cmd.expandTree(node);
        }
      }
    },
    $$('TreeExpanderButton', {
      width: 14,
      'ButtonBorder.fill': 'whitesmoke',
      'ButtonBorder.stroke': null,
      _buttonFillOver: 'rgba(0, 128, 255, 0.25)',
      _buttonStrokeOver: null
    }),
    $$(
      go.Panel,
      'Horizontal',
      {
        position: new go.Point(16, 0)
      },
      new go.Binding('background', 'isSelected', function(s) {
        return s ? 'lightblue' : 'white';
      }).ofObject(),
      $$(
        go.Picture,
        {
          width: 20,
          height: 20,
          margin: new go.Margin(0, 5, 0, 4),
          imageStretch: go.GraphObject.Uniform
        },
        // bind the picture source on two properties of the Node
        // to display open folder, closed folder, or document
        new go.Binding('source', 'isTreeExpanded', imageConverter).ofObject(),
        new go.Binding('source', 'isTreeLeaf', imageConverter).ofObject()
      ),
      $$(
        go.TextBlock,
        {
          font: '16px Verdana, sans-serif'
        },
        new go.Binding('text', 'key')
      )
    )
  );

  // link without lines
  diagram.linkTemplate = $$(go.Link);

  // get json to populate tree
  $.getJSON('assets/json/treeData.json', processData);

  function processData(data) {
    diagram.model = new go.TreeModel(data);
  }

  // clear details when single-click happened in the background of the Diagram, not on a node
  diagram.addDiagramListener('BackgroundSingleClicked', clearDetails);

  // takes a property change on either isTreeLeaf or isTreeExpanded and selects the correct image to use
  function imageConverter(prop, picture) {
    var node = picture.part;
    if (node.isTreeLeaf) {
      if (node.data.folder == 'false') {
        return 'assets/images/document.png';
      } else {
        return 'assets/images/closedFolder.png';
      }
    } else {
      if (node.isTreeExpanded) {
        return 'assets/images/openFolder.png';
      } else {
        return 'assets/images/closedFolder.png';
      }
    }
  }

  // Function to display details about each node.
  function showDetails(e, node) {
    $('.node-details').html(
      '<div class="alert alert-info">' + node.data.details + '</div>'
    );
  }

  // Function to clear details.
  function clearDetails() {
    $('.node-details').html('');
  }
});
