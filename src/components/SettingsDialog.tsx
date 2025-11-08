import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useBoxVisibility } from '@/hooks/useBoxVisibility';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const { settings, updateSetting } = useBoxVisibility();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-glass-border">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure the visibility of interface elements
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Visibility</h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="infobox-toggle" className="cursor-pointer">
                InfoBox (Visitor)
              </Label>
              <Switch
                id="infobox-toggle"
                checked={settings.infoBox}
                onCheckedChange={(checked) => updateSetting('infoBox', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="weatherbox-toggle" className="cursor-pointer">
                WeatherBox
              </Label>
              <Switch
                id="weatherbox-toggle"
                checked={settings.weatherBox}
                onCheckedChange={(checked) => updateSetting('weatherBox', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="chatbox-toggle" className="cursor-pointer">
                ChatBox
              </Label>
              <Switch
                id="chatbox-toggle"
                checked={settings.chatBox}
                onCheckedChange={(checked) => updateSetting('chatBox', checked)}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
