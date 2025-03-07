import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import AppBar from "@mui/material/AppBar";
import Autocomplete from "@mui/material/Autocomplete";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import Fab from "@mui/material/Fab";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import LinearProgress from "@mui/material/LinearProgress";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Modal from "@mui/material/Modal";
import Pagination from "@mui/material/Pagination";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Rating from "@mui/material/Rating";
import Select from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import Slider from "@mui/material/Slider";
import Snackbar from "@mui/material/Snackbar";
import SpeedDial from "@mui/material/SpeedDial";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Switch from "@mui/material/Switch";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import React, { useEffect } from "react";
import { LiveEditor, LiveError, LivePreview, LiveProvider } from "react-live";

// Extend Window interface to include mergeState
declare global {
    interface Window {
        mergeState: (state: Record<string, unknown>) => void;
    }
}

interface ReactLiveRendererProps {
    code: string;
    scope?: Record<string, unknown>;
    props?: Record<string, unknown>;
    noInline?: boolean;
    showEditor?: boolean;
}

export interface BoxContent {
    spec: string;
    jsx: string;
    initialState: Record<string, unknown>;
    description: string;
}

export const ReactLiveRenderer: React.FC<ReactLiveRendererProps> = ({
    code,
    scope = {},
    props = {},
    noInline = false,
    showEditor = false,
}) => {
    // Create a combined scope with React and the props
    const combinedScope = {
        ...scope,
        React,
        // Material UI Components
        Accordion,
        AccordionSummary,
        AccordionDetails,
        Alert,
        AppBar,
        Autocomplete,
        Avatar,
        Badge,
        BottomNavigation,
        BottomNavigationAction,
        Breadcrumbs,
        Button,
        Fab,
        ButtonGroup,
        Card,
        CardContent,
        CardActions,
        CardHeader,
        CardMedia,
        Checkbox,
        Chip,
        Dialog,
        DialogActions,
        DialogContent,
        DialogContentText,
        DialogTitle,
        Divider,
        Drawer,
        Grid,
        ImageList,
        ImageListItem,
        Link,
        List,
        ListItem,
        ListItemButton,
        ListItemIcon,
        ListItemText,
        Menu,
        MenuItem,
        Modal,
        Pagination,
        Paper,
        CircularProgress,
        LinearProgress,
        Radio,
        RadioGroup,
        Rating,
        Select,
        Skeleton,
        Slider,
        Snackbar,
        SpeedDial,
        Stepper,
        Step,
        StepLabel,
        Switch,
        Table,
        TableBody,
        TableCell,
        TableContainer,
        TableHead,
        TableRow,
        Tabs,
        Tab,
        TextField,
        ToggleButton,
        ToggleButtonGroup,
        Tooltip,
        Typography,
        FormControl,
        FormControlLabel,
        FormGroup,
        FormLabel,
        Box,
        Container,
        Icon,
        ...props,
    };

    // Add mergeState to window if it doesn't exist
    useEffect(() => {
        if (!window.mergeState) {
            window.mergeState = (state: Record<string, unknown>) => {
                console.log("State updated:", state);
            };
        }
    }, []);

    return (
        <LiveProvider code={code} scope={combinedScope} noInline={noInline}>
            <div className="w-full h-full bg-white p-4 rounded-lg shadow-md">
                <LivePreview className="w-full h-full overflow-auto" />
                {showEditor && (
                    <div className="mt-4 rounded overflow-hidden">
                        <LiveEditor className="mt-4 rounded overflow-hidden" />
                        <LiveError className="text-red-500 mt-2" />
                    </div>
                )}
            </div>
        </LiveProvider>
    );
};
