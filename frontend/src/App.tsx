import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { env } from "./config/env";
import {
  approveTimeEntry,
  createConsultant,
  createExpense,
  createForecast,
  createProject,
  createTimeEntry,
  getHealth,
  getStatsOverview,
  listConsultants,
  listExpenses,
  listForecasts,
  listProjects,
  listTimeEntries,
  rejectTimeEntry,
  type Consultant,
  type Expense,
  type Forecast,
  type HealthResponse,
  type Project,
  type StatsOverview,
  type TimeEntry,
} from "./services/api";
import "./App.css";

type TabId = "dashboard" | "projects" | "consultants" | "timeEntries" | "expenses" | "forecasts";

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "projects", label: "Proyectos" },
  { id: "consultants", label: "Consultores" },
  { id: "timeEntries", label: "Horas" },
  { id: "expenses", label: "Gastos" },
  { id: "forecasts", label: "Proyecciones" },
];

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function numberish(value: string | null | undefined) {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [stats, setStats] = useState<StatsOverview | null>(null);

  const [projectForm, setProjectForm] = useState({
    name: "",
    company: "",
    country: "",
    currency: "USD",
    budget: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [consultantForm, setConsultantForm] = useState({
    fullName: "",
    email: "",
    role: "",
    hourlyRate: "",
    active: true,
  });

  const [timeForm, setTimeForm] = useState({
    projectId: "",
    consultantId: "",
    workDate: "",
    hours: "",
    note: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    projectId: "",
    expenseDate: "",
    category: "",
    amount: "",
    currency: "USD",
    description: "",
  });

  const [forecastForm, setForecastForm] = useState({
    projectId: "",
    consultantId: "",
    period: "",
    hoursProjected: "",
    hourlyRate: "",
    note: "",
  });

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [healthResult, projectsResult, consultantsResult, timeEntriesResult, expensesResult, forecastsResult, statsResult] =
        await Promise.all([
          getHealth(),
          listProjects(),
          listConsultants(),
          listTimeEntries(),
          listExpenses(),
          listForecasts(),
          getStatsOverview(),
        ]);

      setHealth(healthResult);
      setProjects(projectsResult);
      setConsultants(consultantsResult);
      setTimeEntries(timeEntriesResult);
      setExpenses(expensesResult);
      setForecasts(forecastsResult);
      setStats(statsResult);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Error cargando datos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await createProject({
        ...projectForm,
        budget: Number(projectForm.budget),
      });
      setProjectForm({
        name: "",
        company: "",
        country: "",
        currency: "USD",
        budget: "",
        startDate: "",
        endDate: "",
        description: "",
      });
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo crear proyecto");
    }
  }

  async function submitConsultant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await createConsultant({
        fullName: consultantForm.fullName,
        email: consultantForm.email,
        role: consultantForm.role,
        hourlyRate: consultantForm.hourlyRate ? Number(consultantForm.hourlyRate) : undefined,
        active: consultantForm.active,
      });
      setConsultantForm({
        fullName: "",
        email: "",
        role: "",
        hourlyRate: "",
        active: true,
      });
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo crear consultor");
    }
  }

  async function submitTimeEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await createTimeEntry({
        projectId: timeForm.projectId,
        consultantId: timeForm.consultantId,
        workDate: timeForm.workDate,
        hours: Number(timeForm.hours),
        note: timeForm.note,
      });
      setTimeForm({
        projectId: "",
        consultantId: "",
        workDate: "",
        hours: "",
        note: "",
      });
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo registrar hora");
    }
  }

  async function submitExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await createExpense({
        projectId: expenseForm.projectId,
        expenseDate: expenseForm.expenseDate,
        category: expenseForm.category,
        amount: Number(expenseForm.amount),
        currency: expenseForm.currency,
        description: expenseForm.description,
      });
      setExpenseForm({
        projectId: "",
        expenseDate: "",
        category: "",
        amount: "",
        currency: "USD",
        description: "",
      });
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo registrar gasto");
    }
  }

  async function submitForecast(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await createForecast({
        projectId: forecastForm.projectId,
        consultantId: forecastForm.consultantId,
        period: forecastForm.period,
        hoursProjected: Number(forecastForm.hoursProjected),
        hourlyRate: forecastForm.hourlyRate ? Number(forecastForm.hourlyRate) : undefined,
        note: forecastForm.note,
      });
      setForecastForm({
        projectId: "",
        consultantId: "",
        period: "",
        hoursProjected: "",
        hourlyRate: "",
        note: "",
      });
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo crear proyección");
    }
  }

  async function reviewTimeEntry(id: string, action: "approve" | "reject") {
    try {
      if (action === "approve") {
        await approveTimeEntry(id, "admin");
      } else {
        await rejectTimeEntry(id, "admin", "No cumple criterio");
      }
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo actualizar estado");
    }
  }

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <h1>App Gestion Demo</h1>
          <p>Gestión integral de proyectos, horas, gastos y proyecciones</p>
        </div>
        <div className="badges">
          <span className={`pill ${health?.ok ? "ok" : "error"}`}>{health?.ok ? "Backend activo" : "Backend no disponible"}</span>
          <span className="pill neutral">API: {env.apiUrl || "No configurada"}</span>
        </div>
      </header>

      <nav className="tabs">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" className={activeTab === tab.id ? "tab active" : "tab"} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </nav>

      {error && <p className="error-banner">{error}</p>}
      {loading && <p className="loading">Cargando datos...</p>}

      {!loading && activeTab === "dashboard" && (
        <section className="grid dashboard-grid">
          <article className="card kpi">
            <h3>Presupuesto total</h3>
            <p>{money(stats?.totals.budget || 0)}</p>
          </article>
          <article className="card kpi">
            <h3>Gasto total</h3>
            <p>{money(stats?.totals.spent || 0)}</p>
          </article>
          <article className="card kpi">
            <h3>Horas totales</h3>
            <p>{(stats?.totals.totalHours || 0).toFixed(2)}</p>
          </article>
          <article className="card kpi">
            <h3>Horas aprobadas</h3>
            <p>{(stats?.totals.approvedHours || 0).toFixed(2)}</p>
          </article>

          <article className="card span-4">
            <h3>Resumen por proyecto</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Proyecto</th>
                    <th>Empresa</th>
                    <th>Presupuesto</th>
                    <th>Gastado</th>
                    <th>Disponible</th>
                    <th>Uso</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.projects || []).map((project) => (
                    <tr key={project.projectId}>
                      <td>{project.projectName}</td>
                      <td>{project.company}</td>
                      <td>{money(project.budget, project.currency)}</td>
                      <td>{money(project.spent, project.currency)}</td>
                      <td>{money(project.remainingBudget, project.currency)}</td>
                      <td>{project.usedBudgetPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      )}

      {!loading && activeTab === "projects" && (
        <section className="grid two-col">
          <article className="card">
            <h3>Nuevo proyecto</h3>
            <form onSubmit={submitProject} className="form-grid">
              <input placeholder="Nombre" value={projectForm.name} onChange={(event) => setProjectForm((prev) => ({ ...prev, name: event.target.value }))} required />
              <input placeholder="Empresa" value={projectForm.company} onChange={(event) => setProjectForm((prev) => ({ ...prev, company: event.target.value }))} required />
              <input placeholder="País" value={projectForm.country} onChange={(event) => setProjectForm((prev) => ({ ...prev, country: event.target.value }))} required />
              <input placeholder="Moneda" value={projectForm.currency} onChange={(event) => setProjectForm((prev) => ({ ...prev, currency: event.target.value }))} required />
              <input type="number" placeholder="Presupuesto" value={projectForm.budget} onChange={(event) => setProjectForm((prev) => ({ ...prev, budget: event.target.value }))} required />
              <input type="date" value={projectForm.startDate} onChange={(event) => setProjectForm((prev) => ({ ...prev, startDate: event.target.value }))} required />
              <input type="date" value={projectForm.endDate} onChange={(event) => setProjectForm((prev) => ({ ...prev, endDate: event.target.value }))} required />
              <textarea placeholder="Descripción" value={projectForm.description} onChange={(event) => setProjectForm((prev) => ({ ...prev, description: event.target.value }))} />
              <button type="submit">Crear proyecto</button>
            </form>
          </article>

          <article className="card">
            <h3>Listado de proyectos</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Empresa</th>
                    <th>Moneda</th>
                    <th>Presupuesto</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td>{project.name}</td>
                      <td>{project.company}</td>
                      <td>{project.currency}</td>
                      <td>{money(numberish(project.budget), project.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      )}

      {!loading && activeTab === "consultants" && (
        <section className="grid two-col">
          <article className="card">
            <h3>Nuevo consultor</h3>
            <form onSubmit={submitConsultant} className="form-grid">
              <input placeholder="Nombre completo" value={consultantForm.fullName} onChange={(event) => setConsultantForm((prev) => ({ ...prev, fullName: event.target.value }))} required />
              <input placeholder="Correo" value={consultantForm.email} onChange={(event) => setConsultantForm((prev) => ({ ...prev, email: event.target.value }))} />
              <input placeholder="Rol" value={consultantForm.role} onChange={(event) => setConsultantForm((prev) => ({ ...prev, role: event.target.value }))} required />
              <input type="number" placeholder="Tarifa por hora" value={consultantForm.hourlyRate} onChange={(event) => setConsultantForm((prev) => ({ ...prev, hourlyRate: event.target.value }))} />
              <label className="check">
                <input type="checkbox" checked={consultantForm.active} onChange={(event) => setConsultantForm((prev) => ({ ...prev, active: event.target.checked }))} />
                Activo
              </label>
              <button type="submit">Crear consultor</button>
            </form>
          </article>

          <article className="card">
            <h3>Listado de consultores</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Rol</th>
                    <th>Tarifa</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {consultants.map((consultant) => (
                    <tr key={consultant.id}>
                      <td>{consultant.fullName}</td>
                      <td>{consultant.role}</td>
                      <td>{money(numberish(consultant.hourlyRate || "0"))}</td>
                      <td>{consultant.active ? "Activo" : "Inactivo"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      )}

      {!loading && activeTab === "timeEntries" && (
        <section className="grid two-col">
          <article className="card">
            <h3>Registrar horas</h3>
            <form onSubmit={submitTimeEntry} className="form-grid">
              <select value={timeForm.projectId} onChange={(event) => setTimeForm((prev) => ({ ...prev, projectId: event.target.value }))} required>
                <option value="">Proyecto</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              <select value={timeForm.consultantId} onChange={(event) => setTimeForm((prev) => ({ ...prev, consultantId: event.target.value }))} required>
                <option value="">Consultor</option>
                {consultants.map((consultant) => (
                  <option key={consultant.id} value={consultant.id}>{consultant.fullName}</option>
                ))}
              </select>
              <input type="date" value={timeForm.workDate} onChange={(event) => setTimeForm((prev) => ({ ...prev, workDate: event.target.value }))} required />
              <input type="number" step="0.25" placeholder="Horas" value={timeForm.hours} onChange={(event) => setTimeForm((prev) => ({ ...prev, hours: event.target.value }))} required />
              <textarea placeholder="Nota" value={timeForm.note} onChange={(event) => setTimeForm((prev) => ({ ...prev, note: event.target.value }))} />
              <button type="submit">Registrar</button>
            </form>
          </article>

          <article className="card">
            <h3>Flujo de aprobación</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Proyecto</th>
                    <th>Consultor</th>
                    <th>Horas</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {timeEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.project.name}</td>
                      <td>{entry.consultant.fullName}</td>
                      <td>{numberish(entry.hours).toFixed(2)}</td>
                      <td>{entry.status}</td>
                      <td>
                        {entry.status === "PENDING" && (
                          <div className="inline-actions">
                            <button type="button" onClick={() => void reviewTimeEntry(entry.id, "approve")}>Aprobar</button>
                            <button type="button" className="ghost" onClick={() => void reviewTimeEntry(entry.id, "reject")}>Rechazar</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      )}

      {!loading && activeTab === "expenses" && (
        <section className="grid two-col">
          <article className="card">
            <h3>Registrar gasto</h3>
            <form onSubmit={submitExpense} className="form-grid">
              <select value={expenseForm.projectId} onChange={(event) => setExpenseForm((prev) => ({ ...prev, projectId: event.target.value }))} required>
                <option value="">Proyecto</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              <input type="date" value={expenseForm.expenseDate} onChange={(event) => setExpenseForm((prev) => ({ ...prev, expenseDate: event.target.value }))} required />
              <input placeholder="Categoría" value={expenseForm.category} onChange={(event) => setExpenseForm((prev) => ({ ...prev, category: event.target.value }))} required />
              <input type="number" step="0.01" placeholder="Valor" value={expenseForm.amount} onChange={(event) => setExpenseForm((prev) => ({ ...prev, amount: event.target.value }))} required />
              <input placeholder="Moneda" value={expenseForm.currency} onChange={(event) => setExpenseForm((prev) => ({ ...prev, currency: event.target.value }))} required />
              <textarea placeholder="Descripción" value={expenseForm.description} onChange={(event) => setExpenseForm((prev) => ({ ...prev, description: event.target.value }))} />
              <button type="submit">Registrar gasto</button>
            </form>
          </article>

          <article className="card">
            <h3>Listado de gastos</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Proyecto</th>
                    <th>Categoría</th>
                    <th>Monto</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>{expense.project.name}</td>
                      <td>{expense.category}</td>
                      <td>{money(numberish(expense.amount), expense.currency)}</td>
                      <td>{new Date(expense.expenseDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      )}

      {!loading && activeTab === "forecasts" && (
        <section className="grid two-col">
          <article className="card">
            <h3>Nueva proyección</h3>
            <form onSubmit={submitForecast} className="form-grid">
              <select value={forecastForm.projectId} onChange={(event) => setForecastForm((prev) => ({ ...prev, projectId: event.target.value }))} required>
                <option value="">Proyecto</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              <select value={forecastForm.consultantId} onChange={(event) => setForecastForm((prev) => ({ ...prev, consultantId: event.target.value }))} required>
                <option value="">Consultor</option>
                {consultants.map((consultant) => (
                  <option key={consultant.id} value={consultant.id}>{consultant.fullName}</option>
                ))}
              </select>
              <input placeholder="Periodo (ej: 2026-Q2)" value={forecastForm.period} onChange={(event) => setForecastForm((prev) => ({ ...prev, period: event.target.value }))} required />
              <input type="number" step="0.5" placeholder="Horas proyectadas" value={forecastForm.hoursProjected} onChange={(event) => setForecastForm((prev) => ({ ...prev, hoursProjected: event.target.value }))} required />
              <input type="number" step="0.01" placeholder="Tarifa/hora" value={forecastForm.hourlyRate} onChange={(event) => setForecastForm((prev) => ({ ...prev, hourlyRate: event.target.value }))} />
              <textarea placeholder="Nota" value={forecastForm.note} onChange={(event) => setForecastForm((prev) => ({ ...prev, note: event.target.value }))} />
              <button type="submit">Guardar proyección</button>
            </form>
          </article>

          <article className="card">
            <h3>Listado de proyecciones</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Proyecto</th>
                    <th>Consultor</th>
                    <th>Periodo</th>
                    <th>Horas</th>
                    <th>Costo</th>
                  </tr>
                </thead>
                <tbody>
                  {forecasts.map((forecast) => (
                    <tr key={forecast.id}>
                      <td>{forecast.project.name}</td>
                      <td>{forecast.consultant.fullName}</td>
                      <td>{forecast.period}</td>
                      <td>{numberish(forecast.hoursProjected).toFixed(2)}</td>
                      <td>{money(forecast.projectedCost || 0, forecast.project.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      )}
    </main>
  );
}

export default App;
