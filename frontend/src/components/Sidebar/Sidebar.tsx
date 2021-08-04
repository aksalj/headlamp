import Box from '@material-ui/core/Box';
import Drawer from '@material-ui/core/Drawer';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import clsx from 'clsx';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { setSidebarSelected, setWhetherSidebarOpen } from '../../redux/actions/actions';
import { useTypedSelector } from '../../redux/reducers/reducers';
import { SidebarEntry } from '../../redux/reducers/ui';
import CreateButton from '../common/Resource/CreateButton';
import HeadlampButton from './HeadlampButton';
import NavigationTabs from './NavigationTabs';
import prepareRoutes from './prepareRoutes';
import SidebarItem from './SidebarItem';
import VersionButton from './VersionButton';

export const drawerWidth = 330;
export const drawerWidthClosed = 64;

const useStyle = makeStyles(theme => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    background: theme.palette.sidebarBg,
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    background: theme.palette.sidebarBg,
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.down('xs')]: {
      background: 'initial',
    },
    [theme.breakpoints.down('sm')]: {
      width: theme.spacing(0),
    },
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
    background: theme.palette.sidebarBg,
  },
  drawerPaper: {
    width: drawerWidth,
    background: theme.palette.sidebarBg,
  },
  sidebarGrid: {
    height: '100%',
  },
  '.MuiListItemText-primary': {
    color: 'red',
  },
}));

export default function Sidebar() {
  const sidebar = useTypedSelector(state => state.ui.sidebar);
  const namespaces = useTypedSelector(state => state.filter.namespaces);
  const dispatch = useDispatch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { t, i18n } = useTranslation();
  const items = React.useMemo(() => prepareRoutes(t), [sidebar.entries, i18n.language]);
  const [open, setOpen] = React.useState(sidebar.isSidebarOpen);

  const search = namespaces.size !== 0 ? `?namespace=${[...namespaces].join('+')}` : '';

  // Use the location to make sure the sidebar is changed, as it depends on the cluster
  // (defined in the URL ATM).
  // @todo: Update this if the active cluster management is changed.
  useLocation();
  if (!sidebar?.isVisible) {
    return null;
  }

  return (
    <PureSidebar
      items={items}
      open={open}
      selectedName={sidebar?.selected}
      search={search}
      onToggleOpen={() => {
        dispatch(setWhetherSidebarOpen(!open));
        setOpen(!open);
      }}
      linkArea={
        <>
          <CreateButton />
          <VersionButton />
        </>
      }
    />
  );
}

export interface PureSidebarProps {
  /** If the sidebar is fully expanded open or shrunk. */
  open: boolean;
  /** To show in the sidebar. */
  items: SidebarEntry[];
  /** The selected route name of the sidebar open. */
  selectedName: string | null;
  /** Called when sidebar toggles between open and closed. */
  onToggleOpen: () => void;
  /** The search part of the url */
  search?: string;
  /** A place to put extra components below the links. */
  linkArea: React.ReactNode;
}

export function PureSidebar({
  open,
  items,
  selectedName,
  onToggleOpen,
  search,
  linkArea,
}: PureSidebarProps) {
  const classes = useStyle();
  const temporaryDrawer = useMediaQuery('(max-width:600px)');
  const smallSideOnly = useMediaQuery('(max-width:960px) and (min-width:600px)');
  // The large sidebar does not open in medium view (600-960px).
  const largeSideBarOpen = (open && !smallSideOnly) || (open && temporaryDrawer);

  const contents = (
    <>
      <HeadlampButton open={largeSideBarOpen} onToggleOpen={onToggleOpen} />
      <Grid
        className={classes.sidebarGrid}
        container
        direction="column"
        justify="space-between"
        wrap="nowrap"
      >
        <Grid item>
          <List>
            {items.map((item, i) => (
              <SidebarItem
                key={i}
                selectedName={selectedName}
                fullWidth={largeSideBarOpen}
                search={search}
                {...item}
              />
            ))}
          </List>
        </Grid>
        <Grid item>
          <Box textAlign="center">{linkArea}</Box>
        </Grid>
      </Grid>
    </>
  );

  if (temporaryDrawer) {
    const toggleDrawer = (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }
      onToggleOpen();
    };

    return (
      <Drawer
        variant="temporary"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
        PaperProps={{
          component: 'nav',
        }}
        open={largeSideBarOpen}
        onClose={onToggleOpen}
      >
        <div role="presentation" onClick={toggleDrawer} onKeyDown={toggleDrawer}>
          {contents}
        </div>
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: largeSideBarOpen,
        [classes.drawerClose]: !largeSideBarOpen,
      })}
      classes={{
        paper: clsx({
          [classes.drawerOpen]: largeSideBarOpen,
          [classes.drawerClose]: !largeSideBarOpen,
        }),
      }}
      PaperProps={{
        component: 'nav',
      }}
    >
      {contents}
    </Drawer>
  );
}

export function useSidebarItem(itemName: string | null) {
  const dispatch = useDispatch();

  React.useEffect(
    () => {
      dispatch(setSidebarSelected(itemName));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
}

export { NavigationTabs };
