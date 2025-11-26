import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Download as DownloadIcon, Search as SearchIcon } from '@mui/icons-material';
import apiClient from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function Reportes() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Datos de reportes
  const [reporteArea, setReporteArea] = useState([]);
  const [reporteCategoria, setReporteCategoria] = useState([]);
  const [reporteDetallado, setReporteDetallado] = useState([]);

  // Filtros para reporte detallado
  const [filtros, setFiltros] = useState({
    area: '',
    categoria: '',
    estado: '',
    search: ''
  });

  // Listas para dropdowns
  const [areas, setAreas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [estados] = useState(['Activo', 'En Mantenimiento', 'Dado de Baja', 'En Reparación']);

  useEffect(() => {
    cargarReportes();
    cargarFiltros();
  }, []);

  const cargarFiltros = async () => {
    try {
      // Cargar áreas únicas
      const resAreas = await apiClient.get('/reportes/por-area');
      setAreas(resAreas.data.map(item => item.area));

      // Cargar categorías
      const resCategorias = await apiClient.get('/reportes/por-categoria');
      setCategorias(resCategorias.data.map(item => item.categoria));
    } catch (err) {
      console.error('Error al cargar filtros:', err);
    }
  };

  const cargarReportes = async () => {
    setLoading(true);
    setError('');
    try {
      const [resArea, resCategoria] = await Promise.all([
        apiClient.get('/reportes/por-area'),
        apiClient.get('/reportes/por-categoria')
      ]);
      setReporteArea(resArea.data);
      setReporteCategoria(resCategoria.data);
    } catch (err) {
      console.error('Error al cargar reportes:', err);
      setError('Error al cargar los reportes. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const buscarDetallado = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filtros.area) params.append('area', filtros.area);
      if (filtros.categoria) params.append('categoria', filtros.categoria);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.search) params.append('search', filtros.search);

      const res = await apiClient.get(`/reportes/detallado?${params.toString()}`);
      setReporteDetallado(res.data);
    } catch (err) {
      console.error('Error al buscar reporte detallado:', err);
      setError('Error al buscar dispositivos.');
    } finally {
      setLoading(false);
    }
  };

  const exportarReporte = async (tipo) => {
    try {
      const params = new URLSearchParams({ tipo });
      
      if (tipo === 'detallado') {
        if (filtros.area) params.append('area', filtros.area);
        if (filtros.categoria) params.append('categoria', filtros.categoria);
        if (filtros.estado) params.append('estado', filtros.estado);
        if (filtros.search) params.append('search', filtros.search);
      }

      const response = await apiClient.get(`/reportes/export?${params.toString()}`, {
        responseType: 'blob'
      });

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${tipo}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error al exportar reporte:', err);
      setError('Error al exportar el reporte.');
    }
  };

  const handleChangeFiltro = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(valor || 0);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography 
        variant="h3" 
        gutterBottom
        sx={{ 
          fontWeight: 600,
          background: 'linear-gradient(135deg, #00bfff 0%, #0099cc 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 4
        }}
      >
        Reportes
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ borderRadius: 3, boxShadow: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Por Área" />
          <Tab label="Por Categoría" />
          <Tab label="Vista Detallada" />
        </Tabs>

        {/* Reporte por Área */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => exportarReporte('area')}
              sx={{ 
                background: 'linear-gradient(135deg, #00bfff 0%, #0099cc 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #0099cc 0%, #007aa3 100%)' }
              }}
            >
              Exportar a Excel
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} lg={8}>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={reporteArea}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="area" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatearMoneda(value)} />
                      <Legend />
                      <Bar dataKey="total_precio" name="Total (USD)" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </Grid>
                <Grid item xs={12} lg={4}>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={reporteArea}
                        dataKey="cantidad"
                        nameKey="area"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {reporteArea.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Grid>
              </Grid>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Área</strong></TableCell>
                      <TableCell align="right"><strong>Cantidad</strong></TableCell>
                      <TableCell align="right"><strong>Total (USD)</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reporteArea.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.area}</TableCell>
                        <TableCell align="right">{row.cantidad}</TableCell>
                        <TableCell align="right">{formatearMoneda(row.total_precio)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </TabPanel>

        {/* Reporte por Categoría */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => exportarReporte('categoria')}
              sx={{ 
                background: 'linear-gradient(135deg, #00bfff 0%, #0099cc 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #0099cc 0%, #007aa3 100%)' }
              }}
            >
              Exportar a Excel
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} lg={8}>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={reporteCategoria}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="categoria" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatearMoneda(value)} />
                      <Legend />
                      <Bar dataKey="total_precio" name="Total (USD)" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </Grid>
                <Grid item xs={12} lg={4}>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={reporteCategoria}
                        dataKey="cantidad"
                        nameKey="categoria"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {reporteCategoria.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Grid>
              </Grid>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Categoría</strong></TableCell>
                      <TableCell align="right"><strong>Cantidad</strong></TableCell>
                      <TableCell align="right"><strong>Total (USD)</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reporteCategoria.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.categoria}</TableCell>
                        <TableCell align="right">{row.cantidad}</TableCell>
                        <TableCell align="right">{formatearMoneda(row.total_precio)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </TabPanel>

        {/* Vista Detallada */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Área"
                value={filtros.area}
                onChange={(e) => handleChangeFiltro('area', e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {areas.map((area) => (
                  <MenuItem key={area} value={area}>{area}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Categoría"
                value={filtros.categoria}
                onChange={(e) => handleChangeFiltro('categoria', e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {categorias.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Estado"
                value={filtros.estado}
                onChange={(e) => handleChangeFiltro('estado', e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {estados.map((est) => (
                  <MenuItem key={est} value={est}>{est}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Buscar"
                placeholder="Nombre, marca, modelo..."
                value={filtros.search}
                onChange={(e) => handleChangeFiltro('search', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={buscarDetallado}
                  sx={{ 
                    background: 'linear-gradient(135deg, #00bfff 0%, #0099cc 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #0099cc 0%, #007aa3 100%)' }
                  }}
                >
                  Buscar
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => exportarReporte('detallado')}
                  disabled={reporteDetallado.length === 0}
                >
                  Exportar Resultados
                </Button>
              </Box>
            </Grid>
          </Grid>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : reporteDetallado.length > 0 ? (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Total encontrado: {reporteDetallado.length} dispositivos | 
                Valor total: {formatearMoneda(reporteDetallado.reduce((sum, item) => sum + (parseFloat(item.precio_usd) || 0), 0))}
              </Typography>
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Nombre</strong></TableCell>
                      <TableCell><strong>Marca</strong></TableCell>
                      <TableCell><strong>Modelo</strong></TableCell>
                      <TableCell><strong>N° Serie</strong></TableCell>
                      <TableCell><strong>Estado</strong></TableCell>
                      <TableCell><strong>Ubicación</strong></TableCell>
                      <TableCell><strong>Categoría</strong></TableCell>
                      <TableCell align="right"><strong>Precio (USD)</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reporteDetallado.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{row.nombre}</TableCell>
                        <TableCell>{row.marca}</TableCell>
                        <TableCell>{row.modelo}</TableCell>
                        <TableCell>{row.numero_serie}</TableCell>
                        <TableCell>{row.estado}</TableCell>
                        <TableCell>{row.ubicacion}</TableCell>
                        <TableCell>{row.categoria}</TableCell>
                        <TableCell align="right">{formatearMoneda(row.precio_usd)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <Alert severity="info">
              Utiliza los filtros y haz clic en "Buscar" para ver dispositivos.
            </Alert>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
}

export default Reportes;
