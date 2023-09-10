import { Grid } from "@mui/material";

type Props = {
  title: string;
};

export const AuthPageHeader = ({ title }: Props) => {
  return (
    <>
      <Grid item xs={4} className="border-b border-gray-400 mb-5"></Grid>
      <Grid item xs={4} className="border-b border-gray-400 mb-5 pb-3">
        <h1>{title}</h1>
      </Grid>
      <Grid item xs={4} className="border-b border-gray-400 mb-5"></Grid>
    </>
  );
};
