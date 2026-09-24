import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { fetchCourses, fetchLessons } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/admin/lecciones")({
  component: AdminLessons;
});

function AdminLessons() {
  return null;
}
