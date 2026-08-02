import { getAllSeries } from '../lib/chapters';
import CatalogClient from './CatalogClient';

export default function CatalogPage() {
  const seriesList = getAllSeries();
  return <CatalogClient seriesList={seriesList} />;
}