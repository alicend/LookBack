import { Grid } from "@mui/material";

// propsの型を定義します
interface CustomToolbarProps {
  label: string;
  onNavigate: (direction: 'PREV' | 'TODAY' | 'NEXT') => void;
}

export const CustomToolbar = ({ label, onNavigate }: CustomToolbarProps) => {
  return (
    <Grid className="rbc-toolbar">
      <Grid item xs={1} className="rbc-btn-group">
        <button 
          type="button" 
          onClick={() => onNavigate('PREV')} 
          className="rbc-btn rbc-toolbar-button"
        >
          Back
        </button>
        <button 
          type="button" 
          onClick={() => onNavigate('TODAY')} 
          className="rbc-btn rbc-toolbar-button rbc-btn-today"
        >
          Today
        </button>
        <button 
          type="button" 
          onClick={() => onNavigate('NEXT')} 
          className="rbc-btn rbc-toolbar-button"
        >
          Next
        </button>
      </Grid>
      <Grid item xs={2}>
      </Grid>
      <Grid item xs={6} className="rbc-toolbar-label text-2xl">
        {label}
      </Grid>
      <Grid item xs={2}>
      </Grid>
      <Grid item xs={1}>
      </Grid>
    </Grid>
  );
}