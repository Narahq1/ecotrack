import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Leaf, Droplets, Trash2, Zap, Plus, TrendingUp, AlertTriangle } from 'lucide-react'
import conceptImage from './assets/environmental_tracker_concept.png'
import './App.css'

const API_BASE = 'http://localhost:5000/api'

const dataTypeIcons = {
  co2: <Leaf className="h-4 w-4" />,
  water: <Droplets className="h-4 w-4" />,
  waste: <Trash2 className="h-4 w-4" />,
  energy: <Zap className="h-4 w-4" />
}

const dataTypeLabels = {
  co2: 'Emissões CO2',
  water: 'Consumo de Água',
  waste: 'Geração de Resíduos',
  energy: 'Consumo de Energia'
}

const dataTypeUnits = {
  co2: 'kg CO2e',
  water: 'litros',
  waste: 'kg',
  energy: 'kWh'
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

function App() {
  const [environmentalData, setEnvironmentalData] = useState([])
  const [summary, setSummary] = useState([])
  const [formData, setFormData] = useState({
    data_type: '',
    value: '',
    unit: '',
    description: '',
    date_recorded: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchEnvironmentalData()
    fetchSummary()
  }, [])

  const fetchEnvironmentalData = async () => {
    try {
      const response = await fetch(`${API_BASE}/environmental-data`)
      const result = await response.json()
      if (result.success) {
        setEnvironmentalData(result.data)
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    }
  }

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_BASE}/environmental-data/summary?period=monthly`)
      const result = await response.json()
      if (result.success) {
        setSummary(result.summary)
      }
    } catch (error) {
      console.error('Erro ao buscar resumo:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE}/environmental-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          unit: dataTypeUnits[formData.data_type]
        }),
      })

      const result = await response.json()
      if (result.success) {
        setFormData({
          data_type: '',
          value: '',
          unit: '',
          description: '',
          date_recorded: new Date().toISOString().split('T')[0]
        })
        fetchEnvironmentalData()
        fetchSummary()
      }
    } catch (error) {
      console.error('Erro ao adicionar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = summary.map(item => ({
    name: dataTypeLabels[item.data_type] || item.data_type,
    value: item.total,
    unit: dataTypeUnits[item.data_type]
  }))

  const pieData = summary.map((item, index) => ({
    name: dataTypeLabels[item.data_type] || item.data_type,
    value: item.total,
    color: COLORS[index % COLORS.length]
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src={conceptImage} 
              alt="EcoTrack" 
              className="w-32 h-32 object-cover rounded-lg shadow-lg"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            EcoTrack
          </h1>
          <p className="text-lg text-gray-600">
            Monitore e gerencie os impactos ambientais da sua organização
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="add-data">Adicionar Dados</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {summary.map((item, index) => (
                <Card key={item.data_type} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {dataTypeLabels[item.data_type]}
                    </CardTitle>
                    {dataTypeIcons[item.data_type]}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {item.total.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dataTypeUnits[item.data_type]} (últimos 30 dias)
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">
                        {item.count} registros
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Impactos por Categoria</CardTitle>
                  <CardDescription>
                    Distribuição dos impactos ambientais (últimos 30 dias)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Impactos</CardTitle>
                  <CardDescription>
                    Proporção relativa dos diferentes tipos de impacto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Add Data Tab */}
          <TabsContent value="add-data">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Adicionar Dados Ambientais
                </CardTitle>
                <CardDescription>
                  Registre novos dados de impacto ambiental da sua organização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="data_type">Tipo de Impacto</Label>
                      <Select
                        value={formData.data_type}
                        onValueChange={(value) => setFormData({ ...formData, data_type: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="co2">Emissões CO2</SelectItem>
                          <SelectItem value="water">Consumo de Água</SelectItem>
                          <SelectItem value="waste">Geração de Resíduos</SelectItem>
                          <SelectItem value="energy">Consumo de Energia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="value">Valor</Label>
                      <Input
                        id="value"
                        type="number"
                        step="0.01"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder="Digite o valor"
                        required
                      />
                      {formData.data_type && (
                        <p className="text-sm text-muted-foreground">
                          Unidade: {dataTypeUnits[formData.data_type]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date_recorded">Data do Registro</Label>
                      <Input
                        id="date_recorded"
                        type="date"
                        value={formData.date_recorded}
                        onChange={(e) => setFormData({ ...formData, date_recorded: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição (Opcional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Adicione detalhes sobre este registro..."
                      rows={3}
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Adicionando...' : 'Adicionar Dados'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Registros</CardTitle>
                <CardDescription>
                  Todos os dados ambientais registrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {environmentalData.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                      <p>Nenhum dado registrado ainda.</p>
                      <p>Comece adicionando alguns dados na aba "Adicionar Dados".</p>
                    </div>
                  ) : (
                    environmentalData.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          {dataTypeIcons[item.data_type]}
                          <div>
                            <p className="font-medium">{dataTypeLabels[item.data_type]}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(item.date_recorded).toLocaleDateString('pt-BR')}
                            </p>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="text-lg">
                            {item.value.toLocaleString()} {item.unit}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App

