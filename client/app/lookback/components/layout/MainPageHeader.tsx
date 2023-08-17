import { useState, type ReactNode } from 'react';
import { Grid, Menu } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconMenu } from './IconMenu';

type Props = {
  title: string
}

export const MainPageHeader = ({ title }: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  return(
    <>
      <Grid item xs={4} className="border-b border-gray-400 mb-5">
      </Grid>
      <Grid item xs={4} className="border-b border-gray-400 mb-5">
        <h1>{title}</h1>
      </Grid>
      <Grid item xs={4} className="border-b border-gray-400 mb-5">
        <div className="flex justify-end">
          <button
            className="bg-transparent mb-2 mr-3 border-none outline-none cursor-pointer"
            aria-controls="menu" 
            aria-haspopup="true" 
            onClick={handleClick}
          >
            <MoreVertIcon/>
          </button>
          <Menu
            id="menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <IconMenu />
          </Menu>
        </div>
      </Grid>
    </>
  );
};