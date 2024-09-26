from django import forms

class PlaceSearchForm(forms.Form):
    query = forms.CharField(required=True, label='Search')
