import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Dumbbell, Check, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';

export default function Calendario() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isAddWorkoutDialogOpen, setIsAddWorkoutDialogOpen] = useState(false);
  const [isViewWorkoutDialogOpen, setIsViewWorkoutDialogOpen] = useState(false);

  // TODO: Fetch calendar data from API - GET /api/calendar
  const mockWorkouts = {
    '2025-10-21': { routine: 'Push', completed: true },
    '2025-10-22': { routine: 'Pull', completed: false },
    '2025-10-23': { routine: 'Legs', completed: false },
    '2025-10-25': { routine: 'Push', completed: false },
  };

  // TODO: Fetch routines from API - GET /api/routines
  const mockRoutines = [
    { id: 1, name: 'Push (Pecho, Hombros, Tríceps)', exercises: 6 },
    { id: 2, name: 'Pull (Espalda, Bíceps)', exercises: 5 },
    { id: 3, name: 'Legs (Piernas)', exercises: 7 },
    { id: 4, name: 'Full Body', exercises: 8 },
    { id: 5, name: 'Upper Body', exercises: 6 },
    { id: 6, name: 'Core & Cardio', exercises: 5 },
  ];

  // TODO: Fetch workout details from API - GET /api/calendar/workout/:date
  const getWorkoutDetails = (date: string) => {
    const workout = mockWorkouts[date];
    if (!workout) return null;

    return {
      date,
      routine: workout.routine === 'Push' ? 'Push - Pecho y Hombros' : 
               workout.routine === 'Pull' ? 'Pull - Espalda y Bíceps' :
               workout.routine === 'Legs' ? 'Legs - Piernas' : workout.routine,
      completed: workout.completed,
      exercises: [
        { id: 1, name: 'Press de Banca', sets: 4, reps: '8-12', weight: [], repsCompleted: [] },
        { id: 2, name: 'Press Militar', sets: 3, reps: '10-12', weight: [], repsCompleted: [] },
        { id: 3, name: 'Aperturas', sets: 3, reps: '12-15', weight: [], repsCompleted: [] },
        { id: 4, name: 'Elevaciones Laterales', sets: 3, reps: '12-15', weight: [], repsCompleted: [] },
      ],
    };
  };

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const handleDayClick = (dateStr: string, hasWorkout: boolean) => {
    setSelectedDate(dateStr);
    if (hasWorkout) {
      // Si tiene entrenamiento, abrir dialog para ver detalles
      setIsViewWorkoutDialogOpen(true);
    } else {
      // Si no tiene entrenamiento, abrir el dialog para añadir
      setIsAddWorkoutDialogOpen(true);
    }
  };

  const handleAddWorkout = (routineId: number) => {
    // TODO: Add workout to calendar - POST /api/calendar
    // const response = await fetch('/api/calendar', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ date: selectedDate, routineId })
    // });
    console.log('Adding workout:', { date: selectedDate, routineId });
    setIsAddWorkoutDialogOpen(false);
    setSelectedDate(null);
  };

  const handleSaveWorkoutData = () => {
    // TODO: Save workout data (weights, reps) - PUT /api/calendar/workout/:date
    // const response = await fetch(`/api/calendar/workout/${selectedDate}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ exercises: workoutData })
    // });
    console.log('Auto-saving workout data for:', selectedDate);
  };

  const handleCloseWorkoutDialog = (open: boolean) => {
    if (!open) {
      // Guardar datos automáticamente al cerrar
      handleSaveWorkoutData();
    }
    setIsViewWorkoutDialogOpen(open);
    if (!open) {
      setSelectedDate(null);
    }
  };

  const handleCompleteWorkout = () => {
    // Guardar datos antes de completar
    handleSaveWorkoutData();
    // TODO: Mark workout as complete - POST /api/calendar/workout/:date/complete
    console.log('Completing workout for:', selectedDate);
    setIsViewWorkoutDialogOpen(false);
    setSelectedDate(null);
  };

  const handleDeleteWorkout = () => {
    // TODO: Delete workout from calendar - DELETE /api/calendar/workout/:date
    console.log('Deleting workout for:', selectedDate);
    setIsViewWorkoutDialogOpen(false);
    setSelectedDate(null);
  };

  const previousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const nextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-900 dark:text-white mb-2">Planificación de Entrenos</h1>
            <p className="text-slate-600 dark:text-slate-400">Organiza tu calendario de entrenamientos</p>
          </div>
          <Link to="/chat-ia/organizar-calendario">
            <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-purple-500/50 transition-all">
              IA: Organizar Calendario
            </Button>
          </Link>
        </div>

        {/* Calendar */}
        <Card className="glass-card card-gradient-blue border-slate-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 dark:text-white capitalize">{monthName}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  onClick={previousMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  onClick={nextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div key={day} className="text-center text-slate-600 dark:text-slate-400 text-sm py-2">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const workout = mockWorkouts[dateStr];
                const isToday = day === 21;

                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(dateStr, !!workout)}
                    className={`aspect-square p-2 rounded-lg border transition-all hover-lift ${
                      isToday
                        ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20'
                        : workout
                        ? workout.completed
                          ? 'border-blue-500 bg-blue-500/10 dark:bg-blue-500/20 hover:bg-blue-500/20 dark:hover:bg-blue-500/30'
                          : 'border-purple-500 bg-purple-500/10 dark:bg-purple-500/20 hover:bg-purple-500/20 dark:hover:bg-purple-500/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="text-slate-900 dark:text-white text-sm mb-1">{day}</div>
                    {workout ? (
                      <div className={`text-xs ${workout.completed ? 'text-blue-500' : 'text-purple-500'}`}>
                        {workout.routine}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center mt-1">
                        <Plus className="h-3 w-3 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="glass-card card-gradient-emerald border-slate-200 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-500/10" />
                <span className="text-slate-700 dark:text-slate-300 text-sm">Hoy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-500/10" />
                <span className="text-slate-700 dark:text-slate-300 text-sm">Completado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-purple-500 bg-purple-500/10" />
                <span className="text-slate-700 dark:text-slate-300 text-sm">Planificado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-700" />
                <span className="text-slate-700 dark:text-slate-300 text-sm">Vacío</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Workout Dialog */}
      <Dialog open={isAddWorkoutDialogOpen} onOpenChange={setIsAddWorkoutDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Añadir Entrenamiento</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Selecciona una rutina para añadir el día{' '}
              {selectedDate && new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-3">
              {mockRoutines.map((routine) => (
                <button
                  key={routine.id}
                  onClick={() => handleAddWorkout(routine.id)}
                  className="w-full text-left p-4 rounded-lg border border-border hover:border-emerald-500 dark:hover:border-emerald-500 bg-card hover:bg-accent transition-all hover-lift group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Dumbbell className="h-4 w-4 text-emerald-500 group-hover:text-emerald-600" />
                        <h4 className="text-foreground">{routine.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {routine.exercises} ejercicios
                      </p>
                    </div>
                    <Plus className="h-5 w-5 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                  </div>
                </button>
              ))}
              
              {/* Nueva Rutina Option */}
              <button
                onClick={() => {
                  setIsAddWorkoutDialogOpen(false);
                  setSelectedDate(null);
                  navigate('/rutinas/crear');
                }}
                className="w-full text-left p-4 rounded-lg border-2 border-dashed border-border hover:border-emerald-500 dark:hover:border-emerald-500 bg-gradient-to-r from-emerald-500/5 to-emerald-600/5 hover:from-emerald-500/10 hover:to-emerald-600/10 transition-all hover-lift group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 dark:bg-emerald-500/20 p-2 rounded-lg group-hover:bg-emerald-500/20 dark:group-hover:bg-emerald-500/30 transition-colors">
                      <Plus className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-foreground">Nueva Rutina</h4>
                      <p className="text-sm text-muted-foreground">Crear una rutina personalizada</p>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddWorkoutDialogOpen(false);
                setSelectedDate(null);
              }}
              className="border-border text-foreground hover:bg-accent"
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Workout Dialog */}
      <Dialog open={isViewWorkoutDialogOpen} onOpenChange={handleCloseWorkoutDialog}>
        <DialogContent className="sm:max-w-[700px] bg-background border-border">
          {selectedDate && (() => {
            const workoutDetails = getWorkoutDetails(selectedDate);
            if (!workoutDetails) return null;

            return (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <DialogTitle className="text-foreground mb-2">
                        {workoutDetails.routine}
                      </DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </DialogDescription>
                    </div>
                    <Badge 
                      variant={workoutDetails.completed ? "default" : "secondary"}
                      className={workoutDetails.completed ? "bg-blue-500 text-white" : "bg-purple-500 text-white"}
                    >
                      {workoutDetails.completed ? 'Completado' : 'Planificado'}
                    </Badge>
                  </div>
                </DialogHeader>

                <ScrollArea className="max-h-[500px] pr-4">
                  <div className="space-y-4">
                    {workoutDetails.exercises.map((exercise) => (
                      <Card key={exercise.id} className="glass-card card-gradient-emerald border-border">
                        <CardHeader>
                          <CardTitle className="text-foreground flex items-center gap-2">
                            <Dumbbell className="h-5 w-5 text-emerald-500" />
                            {exercise.name}
                          </CardTitle>
                          <p className="text-muted-foreground text-sm">
                            {exercise.sets} series × {exercise.reps} reps
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {Array.from({ length: exercise.sets }).map((_, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 bg-background/50 dark:bg-background/80 rounded-lg border border-border">
                                <span className="text-foreground min-w-[60px]">Serie {index + 1}</span>
                                <Input 
                                  placeholder="Peso (kg)" 
                                  type="number"
                                  className="w-24 bg-background border-border text-foreground" 
                                />
                                <Input 
                                  placeholder="Reps" 
                                  type="number"
                                  className="w-20 bg-background border-border text-foreground" 
                                />
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>

                <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between">
                  <Button
                    variant="outline"
                    onClick={handleDeleteWorkout}
                    className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500 sm:mr-auto"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                  <div className="flex gap-2 flex-1 sm:flex-initial">
                    <Button
                      variant="outline"
                      onClick={() => handleCloseWorkoutDialog(false)}
                      className="border-border text-foreground hover:bg-accent flex-1 sm:flex-initial"
                    >
                      Cerrar
                    </Button>
                    <Button
                      onClick={handleCompleteWorkout}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white flex-1 sm:flex-initial"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Completar
                    </Button>
                  </div>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
